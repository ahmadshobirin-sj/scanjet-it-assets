<?php

namespace App\Http\Filters;

use App\Tables\Enums\AdvanceOperator;
use App\Tables\Supports\AdvancedFilterEngine;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Spatie\QueryBuilder\Filters\Filter;

/**
 * GlobalSearchNew (final)
 * -----------------------
 * Pencarian global berbasis daftar kolom:
 *  - Direct: "assets.code", "name"
 *  - Nested: "assignments.assigned_user.name", dll
 *  - Pivot: "assignments.pivot.returned_at"
 *  - Cross-connection: didelegasikan ke AdvancedFilterEngine
 *  - Count columns: via HAVING (mis. alias dari withCount)
 */
class GlobalSearchNew implements Filter
{
    /** @var array<string> daftar kolom yang ditelusuri (direct/nested/pivot) */
    protected array $columns;

    /** @var array<string> daftar alias kolom count (sudah dipilih lewat withCount sebelumnya) */
    protected array $countColumns;

    /** @var array<string,string> hints "relation.path" => "connection_name" (opsional) */
    protected array $connectionHints;

    /** hasil parsing: direct columns */
    protected array $directColumns = [];

    /** hasil parsing: mapping relationPath => [col, col, ...] */
    protected array $relationColumns = [];

    public function __construct(array $columns = [], array $countColumns = [], array $connectionHints = [])
    {
        $this->columns = $columns;
        $this->countColumns = $countColumns;
        $this->connectionHints = $connectionHints;

        $this->prepareColumns();
    }

    /**
     * prepareColumns
     * ---------------
     * Pisahkan antara kolom langsung vs nested path.
     */
    protected function prepareColumns(): void
    {
        foreach ($this->columns as $col) {
            if (strpos($col, '.') === false) {
                $this->directColumns[] = $col;

                continue;
            }
            $parts = explode('.', $col);
            $last = array_pop($parts);
            $path = implode('.', $parts);
            $this->relationColumns[$path][] = $last;
        }
    }

    /**
     * __invoke
     * --------
     * Implementasi Spatie Filter.
     * - Bungkus semua kondisi pada satu group where(...) dengan OR di dalamnya.
     * - Count columns: ditambahkan sebagai OR HAVING di luar group where utama.
     */
    public function __invoke(EloquentBuilder $query, $value, string $property): EloquentBuilder
    {
        $term = trim((string) $value);
        if ($term === '') {
            return $query;
        }

        // 1) WHERE (... OR ...) untuk direct & nested/pivot
        $query->where(function ($outer) use ($term) {
            // a) Direct columns → orWhere LIKE
            foreach ($this->directColumns as $col) {
                $outer->orWhere($col, 'LIKE', "%{$term}%");
            }

            // b) Nested/pivot columns → OR (EXISTS ...) via Engine::apply dalam sub-group
            foreach ($this->relationColumns as $path => $cols) {
                // satu group OR untuk setiap relation path (agar (col1 OR col2 ...) di dalam path yang sama)
                $outer->orWhere(function ($group) use ($path, $cols, $term) {
                    foreach ($cols as $relCol) {
                        $prop = $path.'.'.$relCol; // contoh: assignments.assigned_user.name
                        AdvancedFilterEngine::apply(
                            $group,                    // builder sub-group
                            $prop,                     // property
                            AdvanceOperator::CONTAINS, // gunakan contains utk global search
                            $term,                     // nilai
                            // applyDirect utk operator contains
                            function (EloquentBuilder|QueryBuilder $qb, string $qualified, AdvanceOperator $op, mixed $val) {
                                // global search → LIKE %term%
                                $qb->where($qualified, 'LIKE', '%'.$val.'%');
                            },
                            ['connectionHints' => $this->connectionHints]
                        );
                    }
                });
            }
        });

        // 2) HAVING untuk count columns (jika term numerik)
        if (! empty($this->countColumns) && is_numeric($term)) {
            $pieces = [];
            $bindings = [];

            foreach ($this->countColumns as $alias) {
                $pieces[] = "{$alias} = ?";
                $bindings[] = (int) $term;
            }

            if (! empty($pieces)) {
                $query->orHavingRaw('('.implode(' OR ', $pieces).')', $bindings);
            }
        }

        return $query;
    }
}
