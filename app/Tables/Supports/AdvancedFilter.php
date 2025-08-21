<?php

namespace App\Tables\Supports;

use App\Tables\Enums\AdvanceOperator;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Spatie\QueryBuilder\Filters\Filter;

/**
 * AdvancedFilter (final)
 * ----------------------
 * Fallback filter generik untuk segala jenis property:
 * - Direct column: "name"
 * - Nested relation: "assignments.assigned_user.name"
 * - Pivot column: "assignments.pivot.returned_at"
 * - Cross-connection: ditangani oleh AdvancedFilterEngine
 *
 * Catatan:
 * - Parsing nilai (op/value) mengikuti konvensi TableState::parseFilters().
 * - Operator level diterapkan via applyDirect() agar reusable & mudah diuji.
 */
class AdvancedFilter implements Filter
{
    /** @var string Path property (boleh nested/pivot) */
    protected string $property;

    /** @var array<string,string> Mapping "relation.path" => "connection_name" (opsional) */
    protected array $connectionHints;

    public function __construct(string $property, array $connectionHints = [])
    {
        $this->property = $property;
        $this->connectionHints = $connectionHints;
    }

    /**
     * Titik masuk Spatie QueryBuilder.
     * - Validasi format (op/value)
     * - Delegasi ke AdvancedFilterEngine::apply()
     */
    public function __invoke(EloquentBuilder $query, $value, string $property) /* no return type */
    {
        // 1) Validasi payload minimal
        if (! is_array($value) || ! isset($value['op'])) {
            return $query;
        }

        $operator = $value['op'] ?? null;
        $filterValue = $value['value'] ?? null;

        if (! $operator) {
            return $query;
        }

        try {
            $op = AdvanceOperator::from($operator);
        } catch (\ValueError $e) {
            return $query; // operator tidak dikenal → no-op
        }

        // 2) Operator butuh value → pastikan ada & tidak kosong
        if ($op->requiresValue()) {
            if (! array_key_exists('value', $value)) {
                return $query;
            }
            // treat '' sebagai kosong; kalau kamu butuh '' sebagai nilai sah, hapus guard ini
            if (is_string($filterValue) && $filterValue === '') {
                return $query;
            }
            if (is_array($filterValue) && count(array_filter($filterValue, fn ($v) => $v !== '' && $v !== null)) === 0) {
                return $query;
            }
        }

        // 3) Delegasikan ke engine (engine handle direct/nested/pivot/cross-conn)
        return AdvancedFilterEngine::apply(
            $query,
            $this->property,
            $op,
            $filterValue,
            // applyDirect: implementasi SQL untuk tiap operator (kolom SUDAH qualified oleh engine)
            function (EloquentBuilder|QueryBuilder $qb, string $qualifiedColumn, AdvanceOperator $op, mixed $val) {
                $this->applyDirect($qb, $qualifiedColumn, $op, $val);
                // NOTE: kalau engine kamu mengharuskan return, ganti jadi:
                // return $this->applyDirect($qb, $qualifiedColumn, $op, $val);
            },
            ['connectionHints' => $this->connectionHints]
        );
    }

    /**
     * Terapkan operator ke kolom yang sudah "qualified" pada builder saat ini.
     * Tidak mengurus relasi/pivot—itu tanggung jawab engine.
     */
    protected function applyDirect(EloquentBuilder|QueryBuilder $qb, string $col, AdvanceOperator $op, mixed $val): void
    {
        // A) Operator tanpa nilai (IS_*)
        if (! $op->requiresValue()) {
            match ($op) {
                AdvanceOperator::IS_NULL, AdvanceOperator::IS_NOT_SET => $qb->whereNull($col),
                AdvanceOperator::IS_NOT_NULL, AdvanceOperator::IS_SET => $qb->whereNotNull($col),
                default => null,
            };

            return;
        }

        // B) Operator bernilai array (BETWEEN/NOT_BETWEEN/IN/NOT_IN)
        if ($op->requiresArrayValue()) {
            $values = is_array($val) ? $val : explode(',', (string) $val);

            if (in_array($op, [AdvanceOperator::BETWEEN, AdvanceOperator::NOT_BETWEEN], true)) {
                if (count($values) < 2) {
                    return;
                }
                [$a, $b] = [$values[0], $values[1]];
                match ($op) {
                    AdvanceOperator::BETWEEN => $qb->whereBetween($col, [$a, $b]),
                    AdvanceOperator::NOT_BETWEEN => $qb->whereNotBetween($col, [$a, $b]),
                    default => null,
                };

                return;
            }

            match ($op) {
                AdvanceOperator::IN => $qb->whereIn($col, $values),
                AdvanceOperator::NOT_IN => $qb->whereNotIn($col, $values),
                default => null,
            };

            return;
        }

        // C) Boolean literal
        if (in_array($op, [AdvanceOperator::IS_TRUE, AdvanceOperator::IS_FALSE], true)) {
            $qb->where($col, '=', $op === AdvanceOperator::IS_TRUE);

            return;
        }

        // D) Text-ish
        if (in_array($op, [
            AdvanceOperator::CONTAINS,
            AdvanceOperator::NOT_CONTAINS,
            AdvanceOperator::STARTS_WITH,
            AdvanceOperator::ENDS_WITH,
        ], true)) {
            $s = (string) $val;
            match ($op) {
                AdvanceOperator::CONTAINS => $qb->where($col, 'LIKE', '%'.$s.'%'),
                AdvanceOperator::NOT_CONTAINS => $qb->where($col, 'NOT LIKE', '%'.$s.'%'),
                AdvanceOperator::STARTS_WITH => $qb->where($col, 'LIKE', $s.'%'),
                AdvanceOperator::ENDS_WITH => $qb->where($col, 'LIKE', '%'.$s),
                default => null,
            };

            return;
        }

        // E) Numeric/Date compare & equals/not_equals
        match ($op) {
            AdvanceOperator::EQUALS => $qb->where($col, '=', $val),
            AdvanceOperator::NOT_EQUALS => $qb->where($col, '!=', $val),
            AdvanceOperator::GREATER_THAN,
            AdvanceOperator::AFTER => $qb->where($col, '>', $val),
            AdvanceOperator::GREATER_THAN_OR_EQUAL,
            AdvanceOperator::EQUAL_OR_AFTER => $qb->where($col, '>=', $val),
            AdvanceOperator::LESS_THAN,
            AdvanceOperator::BEFORE => $qb->where($col, '<', $val),
            AdvanceOperator::LESS_THAN_OR_EQUAL,
            AdvanceOperator::EQUAL_OR_BEFORE => $qb->where($col, '<=', $val),
            default => null,
        };
    }
}
