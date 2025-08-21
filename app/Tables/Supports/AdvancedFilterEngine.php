<?php

namespace App\Tables\Supports;

use App\Tables\Enums\AdvanceOperator;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Facades\DB;

/**
 * 2
 * AdvancedFilterEngine
 * --------------------
 * Mesin generik untuk menerapkan filter ke properti:
 *  - Kolom langsung: "name"
 *  - Nested relation: "assignments.assigned_user.name"
 *  - Kolom pivot: "assignments.pivot.returned_at"
 *  - Cross connection: same-host/driver → JOIN lintas DB (fully qualified),
 *    beda server/driver → fallback dua-langkah (portable).
 *
 * $applyDirect = fn(Builder $qb, string $qualifiedColumn, AdvanceOperator $op, mixed $value) => void
 * bertugas mengeksekusi operator (LIKE, BETWEEN, =, dll) pada kolom target.
 */
class AdvancedFilterEngine
{
    /**
     * Entry point apply filter untuk property (direct / nested / pivot).
     */
    public static function apply(
        EloquentBuilder $rootQuery,
        string $property,
        AdvanceOperator $op,
        mixed $value,
        callable $applyDirect,
        array $options = []
    ): EloquentBuilder {
        $segments = explode('.', $property);

        // Mode pivot: rel.pivot.col
        $pivotIdx = array_search('pivot', $segments, true);
        if ($pivotIdx !== false) {
            $relName = $segments[$pivotIdx - 1] ?? null;
            $pivotCol = implode('.', array_slice($segments, $pivotIdx + 1));
            if (! $relName || $pivotCol === '') {
                return $rootQuery;
            }

            $model = $rootQuery->getModel();
            if (! method_exists($model, $relName)) {
                return $rootQuery;
            }

            $rel = $model->{$relName}();
            if (! $rel instanceof BelongsToMany) {
                return $rootQuery;
            }

            $pivotTable = $rel->getTable();

            // Filter di whereHas(rel) terhadap kolom pivot
            return $rootQuery->whereHas($relName, function (EloquentBuilder $q) use ($pivotTable, $pivotCol, $op, $value, $applyDirect) {
                self::callApplyDirect($applyDirect, $q, "{$pivotTable}.{$pivotCol}", $op, $value);
            });
        }

        // Nested: path relasi + kolom target
        $targetCol = array_pop($segments);
        $relationPath = $segments;

        // Kolom langsung
        if (empty($relationPath)) {
            self::callApplyDirect($applyDirect, $rootQuery, $targetCol, $op, $value);

            return $rootQuery;
        }

        // Resolve metadata chain relasi
        $resolved = self::resolveChain($rootQuery->getModel(), $relationPath);
        if (! $resolved) {
            // Fallback aman: whereHas(path) + apply operator pada kolom target
            $rel = implode('.', $relationPath);

            return $rootQuery->whereHas($rel, function (EloquentBuilder $q) use ($targetCol, $op, $value, $applyDirect) {
                self::callApplyDirect($applyDirect, $q, $targetCol, $op, $value);
            });
        }

        [
            'rootRelName' => $rootRelName,
            'finalRel' => $finalRel,
            'finalModel' => $finalModel,
            'finalTable' => $finalTable,
            'finalConnName' => $finalConnName,
        ] = $resolved;

        // Ambil hint koneksi bila ada
        $hints = $options['connectionHints'] ?? [];
        $hintKey = implode('.', $relationPath);
        $hintConn = $hints[$hintKey] ?? ($hints[$relationPath[0]] ?? $finalConnName);

        // Same-host/driver? gunakan EXISTS JOIN lintas DB
        [$sameServer, $finalDb] = self::resolveCrossDb($rootQuery->getConnection(), $hintConn);
        if ($sameServer && $finalDb) {
            return self::applyViaCrossDbExistsJoin(
                $rootQuery,
                $rootRelName,
                $finalRel,
                $finalTable,
                $finalDb,
                $targetCol,
                $op,
                $value,
                $applyDirect
            );
        }

        // Fallback portable dua-langkah
        return self::applyViaTwoStep(
            $rootQuery,
            $rootRelName,
            $finalRel,
            $finalModel,
            $targetCol,
            $op,
            $value,
            $applyDirect,
            $hintConn
        );
    }

    /**
     * Helper pemanggil callback operator.
     */
    protected static function callApplyDirect(
        callable $applyDirect,
        EloquentBuilder|QueryBuilder $q,
        string $qualifiedColumn,
        AdvanceOperator $op,
        mixed $value
    ): void {
        $applyDirect($q, $qualifiedColumn, $op, $value);
    }

    /**
     * Menelusuri path relasi & mengembalikan metadata final.
     */
    protected static function resolveChain($rootModel, array $relationPath): ?array
    {
        $currentModel = $rootModel;
        $rootRelName = null;
        $finalRel = null;

        foreach ($relationPath as $idx => $name) {
            if (! method_exists($currentModel, $name)) {
                return null;
            }
            /** @var Relation $rel */
            $rel = $currentModel->{$name}();

            if ($idx === 0) {
                $rootRelName = $name;
            }

            $currentModel = $rel->getRelated();
            if ($idx === count($relationPath) - 1) {
                $finalRel = $rel;
            }
        }

        if (! $finalRel) {
            return null;
        }

        return [
            'rootRelName' => $rootRelName,
            'finalRel' => $finalRel,
            'finalModel' => $currentModel,
            'finalTable' => $currentModel->getTable(),
            'finalConnName' => $currentModel->getConnectionName(),
        ];
    }

    /**
     * Membandingkan koneksi root & target untuk JOIN lintas DB (fully-qualified).
     * Return [bool $sameServer, ?string $finalDbName]
     */
    protected static function resolveCrossDb($mainConn, ?string $targetConnName): array
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
        // jika trans-driver interface tidak expose method, method_exists menjaga supaya tidak error.
    }

    /**
     * Strategi same-host/driver: WHERE EXISTS + JOIN fully-qualified antar DB.
     */
    protected static function applyViaCrossDbExistsJoin(
        EloquentBuilder $rootQuery,
        string $rootRelName,
        Relation $finalRel,
        string $finalTable,
        string $finalDb,
        string $targetCol,
        AdvanceOperator $op,
        mixed $value,
        callable $applyDirect
    ): EloquentBuilder {
        $parentTable = $rootQuery->getModel()->getTable();

        /** @var Relation $rootRel */
        $rootRel = $rootQuery->getModel()->{$rootRelName}();

        // Implementasi generik & aman: saat ini fokus pada rantai yang diawali BelongsToMany;
        // jika bukan, jatuh ke portable two-step untuk menghindari asumsi salah.
        if (! $rootRel instanceof BelongsToMany) {
            return self::applyViaTwoStep(
                $rootQuery,
                $rootRelName,
                $finalRel,
                $finalRel->getRelated(),
                $targetCol,
                $op,
                $value,
                $applyDirect,
                $finalRel->getRelated()->getConnectionName()
            );
        }

        $pivotTable = $rootRel->getTable();
        $foreignPivot = $rootRel->getForeignPivotKeyName();  // pivot → parent PK
        $relatedPivot = $rootRel->getRelatedPivotKeyName();  // pivot → mid PK
        $midTable = $rootRel->getRelated()->getTable();
        $midPk = $rootRel->getRelated()->getKeyName();

        return $rootQuery->whereExists(function (QueryBuilder $sub) use (
            $parentTable,
            $pivotTable,
            $foreignPivot,
            $relatedPivot,
            $midTable,
            $midPk,
            $finalRel,
            $finalTable,
            $finalDb,
            $targetCol,
            $op,
            $value,
            $applyDirect
        ) {
            // parent → pivot → mid
            $sub->selectRaw('1')
                ->from($midTable)
                ->join($pivotTable, "{$pivotTable}.{$relatedPivot}", '=', "{$midTable}.{$midPk}")
                ->whereColumn("{$pivotTable}.{$foreignPivot}", "{$parentTable}.id");

            // mid → final (fully-qualified ke DB target)
            $finalAlias = 'final_rel';
            $qualifiedFin = DB::raw("`{$finalDb}`.`{$finalTable}` as `{$finalAlias}`");

            if ($finalRel instanceof BelongsTo) {
                $fk = $finalRel->getForeignKeyName(); // kolom di mid yang menunjuk final
                $pk = $finalRel->getOwnerKeyName();   // kolom PK di final
                $sub->join($qualifiedFin, "{$midTable}.{$fk}", '=', "{$finalAlias}.{$pk}");
            } elseif ($finalRel instanceof HasOne || $finalRel instanceof HasMany) {
                $fkToMid = method_exists($finalRel, 'getForeignKeyName')
                    ? $finalRel->getForeignKeyName()
                    : explode('.', $finalRel->getQualifiedForeignKeyName())[1];
                $pkMid = $finalRel->getLocalKeyName();
                $sub->join($qualifiedFin, "{$finalAlias}.{$fkToMid}", '=', "{$midTable}.{$pkMid}");
            } else {
                return; // tipe tak didukung di jalur ini (hindari error)
            }

            // apply operator pada kolom final
            self::callApplyDirect($applyDirect, $sub, "{$finalAlias}.{$targetCol}", $op, $value);
        });
    }

    /**
     * Fallback portable dua-langkah (lintas server/driver):
     *  1) Query FINAL di koneksi target → ambil subset id/foreign key sesuai operator.
     *  2) whereHas(rootRelName) pada MID dengan whereIn sesuai tipe relasi.
     */
    protected static function applyViaTwoStep(
        EloquentBuilder $rootQuery,
        string $rootRelName,
        Relation $finalRel,
        $finalModel,
        string $targetCol,
        AdvanceOperator $op,
        mixed $value,
        callable $applyDirect,
        ?string $finalConnName
    ): EloquentBuilder {
        // 1) siapkan instance FINAL pada koneksi target
        /** @var \Illuminate\Database\Eloquent\Model $instance */
        $instance = new ($finalModel::class);
        if ($finalConnName) {
            $instance->setConnection($finalConnName);
        }

        // 2) filter FINAL sesuai operator
        $finalBaseQ = $instance->newQuery()->select('*');
        $finalPk = $finalModel->getKeyName();
        $applyDirect($finalBaseQ, $targetCol, $op, $value);

        // 3a) BelongsTo → sudah ada (tetap)
        if ($finalRel instanceof BelongsTo) {
            $finalIds = (clone $finalBaseQ)->select($finalPk)->pluck($finalPk);

            return $rootQuery->whereHas($rootRelName, function (EloquentBuilder $midQ) use ($finalRel, $finalIds) {
                $fkToFinal = $finalRel->getForeignKeyName();
                $midQ->whereIn($fkToFinal, $finalIds);
            });
        }

        // 3b) HasOne/HasMany → sudah ada (tetap)
        if ($finalRel instanceof HasOne || $finalRel instanceof HasMany) {
            $fkToMid = method_exists($finalRel, 'getForeignKeyName')
                ? $finalRel->getForeignKeyName()
                : explode('.', $finalRel->getQualifiedForeignKeyName())[1];
            $localKey = $finalRel->getLocalKeyName();

            $midIds = (clone $finalBaseQ)->select($fkToMid)->pluck($fkToMid);

            return $rootQuery->whereHas($rootRelName, function (EloquentBuilder $midQ) use ($localKey, $midIds) {
                $midQ->whereIn($localKey, $midIds);
            });
        }

        // 3c) ⬅️⬅️ **Tambahkan ini: BelongsToMany / MorphToMany**
        if ($finalRel instanceof BelongsToMany || $finalRel instanceof MorphToMany) {
            // ambil daftar PK FINAL yang lolos filter pada koneksi FINAL
            $finalIds = (clone $finalBaseQ)->select($finalPk)->pluck($finalPk);

            // CONSTRAIN relasi via KOLOM PIVOT yang mengarah ke FINAL,
            // supaya tidak menyentuh tabel FINAL di subquery (portable lintas koneksi)
            $qualifiedPivotRelatedKey = method_exists($finalRel, 'getQualifiedRelatedPivotKeyName')
                ? $finalRel->getQualifiedRelatedPivotKeyName()           // contoh: model_has_roles.role_id
                : ($finalRel->getTable().'.'.$finalRel->getRelatedPivotKeyName());

            return $rootQuery->whereHas($rootRelName, function (EloquentBuilder $relQ) use ($qualifiedPivotRelatedKey, $finalIds) {
                $relQ->whereIn($qualifiedPivotRelatedKey, $finalIds);
            });
        }

        // tipe lain → no-op (portability diutamakan)
        return $rootQuery;
    }
}
