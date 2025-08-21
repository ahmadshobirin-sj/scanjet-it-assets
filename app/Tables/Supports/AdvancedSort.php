<?php

namespace App\Tables\Sorts;

use App\Tables\Supports\OrderByField;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\Sorts\Sort;

/**
 * AdvancedSort
 * ------------
 * Sort generik:
 *  - Direct column: "name"
 *  - Nested: "assignments.assigned_user.name"
 *  - Pivot: "assignments.pivot.returned_at"
 *  - Cross-connection: same-host/driver → subquery scalar; beda server → fallback OrderByField.
 */
class AdvancedSort implements Sort
{
    /** @var array<string,string> mapping "relation.path" => "connection_name" */
    protected array $connectionHints;

    /** @var string path property yang ingin di-sort */
    protected string $property;

    public function __construct(string $property, array $connectionHints = [])
    {
        $this->property = $property;
        $this->connectionHints = $connectionHints;
    }

    /**
     * Dipanggil oleh Spatie QueryBuilder ketika sorting diminta.
     */
    public function __invoke(EloquentBuilder $query, bool $descending, string $property): EloquentBuilder
    {
        $direction = $descending ? 'desc' : 'asc';
        $segments = explode('.', $this->property);

        // Pivot sorting: rel.pivot.col
        $pivotIdx = array_search('pivot', $segments, true);
        if ($pivotIdx !== false) {
            return $this->sortByPivot($query, $segments, $direction);
        }

        // Nested sorting: a.b.c
        if (count($segments) > 1) {
            return $this->sortByNested($query, $segments, $direction);
        }

        // Direct column
        return $query->orderBy($this->property, $direction);
    }

    /**
     * Sorting berdasarkan kolom pivot (BelongsToMany) dengan subquery MIN() agar deterministic.
     */
    protected function sortByPivot(EloquentBuilder $query, array $segments, string $direction): EloquentBuilder
    {
        $pivotPos = array_search('pivot', $segments, true);
        $relName = $segments[$pivotPos - 1] ?? null;
        $pivotCol = implode('.', array_slice($segments, $pivotPos + 1));

        if (! $relName || $pivotCol === '') {
            return $query;
        }

        $model = $query->getModel();
        if (! method_exists($model, $relName)) {
            return $query;
        }

        /** @var BelongsToMany $rel */
        $rel = $model->{$relName}();
        if (! $rel instanceof BelongsToMany) {
            return $query;
        }

        $parentTable = $model->getTable();
        $parentKey = $model->getKeyName();
        $pivotTable = $rel->getTable();
        $foreignPivot = $rel->getForeignPivotKeyName();  // pivot → parent PK

        $sub = $this->wrapSubquery(function (QueryBuilder $sub) use ($pivotTable, $foreignPivot, $parentTable, $parentKey, $pivotCol) {
            $sub->from($pivotTable)
                ->selectRaw("MIN({$pivotTable}.{$pivotCol})")
                ->whereColumn("{$pivotTable}.{$foreignPivot}", "{$parentTable}.{$parentKey}");
        });

        return $query->orderBy($sub, $direction);
    }

    /**
     * Sorting nested: same-host/driver pakai subquery scalar; beda server pakai fallback OrderByField.
     */
    protected function sortByNested(EloquentBuilder $query, array $segments, string $direction): EloquentBuilder
    {
        $targetCol = array_pop($segments);
        $relationKey = implode('.', $segments);
        $model = $query->getModel();

        $resolved = $this->resolveChain($model, $segments);
        if (! $resolved) {
            return $query;
        }

        [
            'rootRelName' => $rootRelName, // tidak dipakai di versi subquery ini
            'finalRel' => $finalRel,
            'finalModel' => $finalModel,
            'finalTable' => $finalTable,
            'finalConnName' => $finalConnName,
        ] = $resolved;

        $hintConn = $this->connectionHints[$relationKey] ?? ($this->connectionHints[$segments[0]] ?? $finalConnName);

        [$sameServer, $finalDb] = $this->resolveCrossDb($query->getConnection(), $hintConn);
        if ($sameServer && $finalDb) {
            return $this->orderByNestedSubquerySameServer(
                $query,
                $finalRel,
                $finalTable,
                $finalDb,
                $targetCol,
                $direction
            );
        }

        return $this->orderByNestedDifferentServer(
            $query,
            $finalRel,
            $finalModel,
            $targetCol,
            $direction,
            $hintConn
        );
    }

    /**
     * Membungkus Query\Builder jadi expression subquery scalar.
     */
    protected function wrapSubquery(callable $builder): \Illuminate\Database\Query\Expression
    {
        $sub = DB::query();
        $builder($sub);

        return DB::raw('('.$sub->toSql().')');
    }

    /**
     * Same-host/driver: subquery MIN(final.targetCol) yang dikorelasikan ke parent.
     */
    protected function orderByNestedSubquerySameServer(
        EloquentBuilder $query,
        Relation $finalRel,
        string $finalTable,
        string $finalDb,
        string $targetCol,
        string $direction
    ): EloquentBuilder {
        $parentTable = $query->getModel()->getTable();
        $parentKey = $query->getModel()->getKeyName();

        $finalAlias = 'f';

        $fkToParent = $this->tryGetFkToParentFromFinal($finalRel);
        if ($fkToParent) {
            $sub = DB::query()
                ->from(DB::raw("`{$finalDb}`.`{$finalTable}` as `{$finalAlias}`"))
                ->selectRaw("MIN({$finalAlias}.{$targetCol})")
                ->whereColumn("{$finalAlias}.{$fkToParent}", "{$parentTable}.{$parentKey}")
                ->limit(1);

            return $query->orderBy(DB::raw('('.$sub->toSql().')'), $direction);
        }

        return $query; // tipe relasi yang tidak langsung tidak dipaksa
    }

    /**
     * Beda server/driver: ambil urutan parent_id dari koneksi target lalu ORDER BY custom via OrderByField.
     */
    protected function orderByNestedDifferentServer(
        EloquentBuilder $query,
        Relation $finalRel,
        $finalModel,
        string $targetCol,
        string $direction,
        ?string $targetConn
    ): EloquentBuilder {
        $parent = $query->getModel();
        $parentTable = $parent->getTable();
        $parentKey = $parent->getKeyName();

        $fkToParent = $this->tryGetFkToParentFromFinal($finalRel);
        if (! $fkToParent) {
            return $query;
        }

        /** @var \Illuminate\Database\Eloquent\Model $inst */
        $inst = new ($finalModel::class);
        if ($targetConn) {
            $inst->setConnection($targetConn);
        }

        $order = strtolower($direction) === 'desc' ? 'desc' : 'asc';

        $orderedParentIds = $inst->newQuery()
            ->select($fkToParent)
            ->orderBy($targetCol, $order)
            ->limit(5000)
            ->pluck($fkToParent)
            ->filter()
            ->values()
            ->all();

        if (empty($orderedParentIds)) {
            return $query;
        }

        return OrderByField::apply(
            $query,
            "{$parentTable}.{$parentKey}",
            $orderedParentIds,
            $direction
        );
    }

    /**
     * Menelusuri path relasi dan pulangkan metadata final.
     */
    protected function resolveChain($rootModel, array $relationPath): ?array
    {
        $current = $rootModel;
        $finalRel = null;
        $rootRel = null;

        foreach ($relationPath as $idx => $name) {
            if (! method_exists($current, $name)) {
                return null;
            }
            /** @var Relation $rel */
            $rel = $current->{$name}();

            if ($idx === 0) {
                $rootRel = $name;
            }
            $current = $rel->getRelated();
            if ($idx === count($relationPath) - 1) {
                $finalRel = $rel;
            }
        }

        if (! $finalRel) {
            return null;
        }

        return [
            'rootRelName' => $rootRel,
            'finalRel' => $finalRel,
            'finalModel' => $current,
            'finalTable' => $current->getTable(),
            'finalConnName' => $current->getConnectionName(),
        ];
    }

    /**
     * Cek apakah koneksi root & target berada pada host/driver yang sama.
     */
    protected function resolveCrossDb($mainConn, ?string $targetConnName): array
    {
        if (! $targetConnName) {
            return [false, null];
        }
        $targetConn = DB::connection($targetConnName);

        $sameDriver = method_exists($mainConn, 'getDriverName')
            && $mainConn->getDriverName() === $targetConn->getDriverName();
        $sameHost = ($mainConn->getConfig('host') ?? null) === ($targetConn->getConfig('host') ?? null);
        $dbName = $targetConn->getDatabaseName();

        return [($sameDriver && $sameHost && $dbName), $dbName];
    }

    /**
     * Best-effort: ambil nama FK di FINAL yang menunjuk ke parent/mid (reliable di HasOne/HasMany).
     */
    protected function tryGetFkToParentFromFinal(Relation $finalRel): ?string
    {
        if ($finalRel instanceof HasOne || $finalRel instanceof HasMany) {
            if (method_exists($finalRel, 'getForeignKeyName')) {
                return $finalRel->getForeignKeyName();
            }
            $qualified = $finalRel->getQualifiedForeignKeyName();

            return explode('.', $qualified)[1] ?? null;
        }

        return null;
    }
}
