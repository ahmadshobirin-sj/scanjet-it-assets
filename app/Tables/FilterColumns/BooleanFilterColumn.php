<?php

namespace App\Tables\FilterColumns;

use App\Tables\Enums\AdvanceOperator;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;

/**
 * BooleanFilterColumn
 * -------------------
 * - Menerima:
 *   * value sederhana: true/false/"1"/"0"
 *   * atau format {op: IS_TRUE|IS_FALSE}
 * - Mendukung nested (dot-notation).
 */
class BooleanFilterColumn extends FilterColumn
{
    protected function setDefaultClauses(): void
    {
        $operators = AdvanceOperator::booleanOperators();

        $this->clauses = array_map(
            fn (AdvanceOperator $op) => [
                'label' => $op->label(),
                'value' => $op->value,
            ],
            $operators
        );

        $this->defaultClause = AdvanceOperator::IS_TRUE->value;
    }

    public function getType(): string
    {
        return 'boolean';
    }

    protected function createFilter(): Filter
    {
        return new class($this->getName()) implements Filter
        {
            public function __construct(private string $property) {}

            public function __invoke(Builder $query, $value, string $property): Builder
            {
                // 1) Nilai boolean sederhana (true/false/"1"/"0")
                if (is_bool($value) || in_array($value, ['true', 'false', '1', '0', 1, 0], true)) {
                    $bool = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                    if ($bool === null) {
                        return $query;
                    }

                    if (str_contains($this->property, '.')) {
                        [$rel, $col] = $this->splitPath($this->property);

                        return $query->whereHas($rel, fn (Builder $q) => $q->where($col, '=', $bool));
                    }

                    return $query->where($this->property, '=', $bool);
                }

                // 2) Format { op: ..., value?: ... }
                if (! is_array($value) || ! isset($value['op'])) {
                    return $query;
                }

                try {
                    $op = AdvanceOperator::from($value['op']);
                } catch (\ValueError) {
                    return $query;
                }

                $apply = function (Builder $q, string $col) use ($op) {
                    return match ($op) {
                        AdvanceOperator::IS_TRUE => $q->where($col, '=', true),
                        AdvanceOperator::IS_FALSE => $q->where($col, '=', false),
                        default => $q,
                    };
                };

                if (str_contains($this->property, '.')) {
                    [$rel, $col] = $this->splitPath($this->property);

                    return $query->whereHas($rel, fn (Builder $q) => $apply($q, $col));
                }

                return $apply($query, $this->property);
            }

            private function splitPath(string $property): array
            {
                $parts = explode('.', $property);
                $col = array_pop($parts);

                return [implode('.', $parts), $col];
            }
        };
    }
}
