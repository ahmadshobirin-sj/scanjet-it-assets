<?php

namespace App\Tables\FilterColumns;

use App\Tables\Enums\AdvanceOperator;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;

/**
 * DateFilterColumn
 * ----------------
 * - Operator tanggal: =, !=, <, <=, >, >=, BETWEEN/NOT_BETWEEN, IS_SET/IS_NOT_SET.
 * - BETWEEN otomatis menambahkan boundary hari: 00:00:00 - 23:59:59.
 * - Single compare menggunakan whereDate untuk presisi tanggal.
 * - Mendukung nested (dot-notation).
 */
class DateFilterColumn extends FilterColumn
{
    protected string $format = 'Y-m-d';

    protected function setDefaultClauses(): void
    {
        $operators = AdvanceOperator::dateOperators();

        $this->clauses = array_map(
            fn (AdvanceOperator $op) => [
                'label' => $op->label(),
                'value' => $op->value,
            ],
            $operators
        );

        $this->defaultClause = AdvanceOperator::EQUALS->value;
    }

    public function format(string $format): static
    {
        $this->format = $format;

        return $this;
    }

    public function getType(): string
    {
        return 'date';
    }

    protected function getMeta(): ?array
    {
        return [
            'format' => $this->format,
            'picker' => 'date',
        ];
    }

    protected function createFilter(): Filter
    {
        return new class($this->getName(), $this->format) implements Filter
        {
            public function __construct(
                private string $property,
                private string $format
            ) {}

            public function __invoke(Builder $query, $value, string $property): Builder
            {
                if (! is_array($value) || ! isset($value['op'])) {
                    return $query;
                }

                $op = $value['op'] ?? null;
                if (! $op) {
                    return $query;
                }

                try {
                    $operator = AdvanceOperator::from($op);
                } catch (\ValueError) {
                    return $query;
                }

                // Operator tanpa value (IS_SET / IS_NOT_SET / IS_(NOT)_NULL)
                if (! $operator->requiresValue()) {
                    return $this->applyNullCheck($query, $operator);
                }

                // Ambil nilai
                $filterValue = $value['value'] ?? null;
                if ($filterValue === null || $filterValue === '') {
                    return $query;
                }

                // Nested?
                if (str_contains($this->property, '.')) {
                    return $this->applyNested($query, $operator, $filterValue);
                }

                // BETWEEN / NOT_BETWEEN → boundary harian
                if ($operator->requiresArrayValue()) {
                    $arr = is_array($filterValue) ? $filterValue : explode(',', (string) $filterValue);
                    if (count($arr) < 2) {
                        return $query;
                    }

                    [$start, $end] = $this->dayBounds($arr[0], $arr[1]);

                    return $operator === AdvanceOperator::BETWEEN
                        ? $query->whereBetween($this->property, [$start, $end])
                        : $query->whereNotBetween($this->property, [$start, $end]);
                }

                // Single compare → whereDate
                return match ($operator) {
                    AdvanceOperator::EQUALS => $query->whereDate($this->property, '=', $filterValue),
                    AdvanceOperator::NOT_EQUALS => $query->whereDate($this->property, '!=', $filterValue),
                    AdvanceOperator::BEFORE,
                    AdvanceOperator::LESS_THAN => $query->whereDate($this->property, '<', $filterValue),
                    AdvanceOperator::AFTER,
                    AdvanceOperator::GREATER_THAN => $query->whereDate($this->property, '>', $filterValue),
                    AdvanceOperator::EQUAL_OR_BEFORE,
                    AdvanceOperator::LESS_THAN_OR_EQUAL => $query->whereDate($this->property, '<=', $filterValue),
                    AdvanceOperator::EQUAL_OR_AFTER,
                    AdvanceOperator::GREATER_THAN_OR_EQUAL => $query->whereDate($this->property, '>=', $filterValue),
                    default => $query,
                };
            }

            private function applyNested(Builder $query, AdvanceOperator $operator, $filterValue): Builder
            {
                [$rel, $col] = $this->splitPath($this->property);

                // BETWEEN/NOT_BETWEEN di nested
                if ($operator->requiresArrayValue()) {
                    $arr = is_array($filterValue) ? $filterValue : explode(',', (string) $filterValue);
                    if (count($arr) < 2) {
                        return $query;
                    }

                    [$start, $end] = $this->dayBounds($arr[0], $arr[1]);

                    return $query->whereHas($rel, function (Builder $q) use ($col, $operator, $start, $end) {
                        if ($operator === AdvanceOperator::BETWEEN) {
                            $q->whereBetween($col, [$start, $end]);
                        } else {
                            $q->whereNotBetween($col, [$start, $end]);
                        }
                    });
                }

                // Single compare di nested → whereDate
                return $query->whereHas($rel, function (Builder $q) use ($col, $operator, $filterValue) {
                    match ($operator) {
                        AdvanceOperator::EQUALS => $q->whereDate($col, '=', $filterValue),
                        AdvanceOperator::NOT_EQUALS => $q->whereDate($col, '!=', $filterValue),
                        AdvanceOperator::BEFORE,
                        AdvanceOperator::LESS_THAN => $q->whereDate($col, '<', $filterValue),
                        AdvanceOperator::AFTER,
                        AdvanceOperator::GREATER_THAN => $q->whereDate($col, '>', $filterValue),
                        AdvanceOperator::EQUAL_OR_BEFORE,
                        AdvanceOperator::LESS_THAN_OR_EQUAL => $q->whereDate($col, '<=', $filterValue),
                        AdvanceOperator::EQUAL_OR_AFTER,
                        AdvanceOperator::GREATER_THAN_OR_EQUAL => $q->whereDate($col, '>=', $filterValue),
                        default => null,
                    };
                });
            }

            private function applyNullCheck(Builder $query, AdvanceOperator $operator): Builder
            {
                if (str_contains($this->property, '.')) {
                    [$rel, $col] = $this->splitPath($this->property);

                    return $query->whereHas($rel, function (Builder $q) use ($col, $operator) {
                        match ($operator) {
                            AdvanceOperator::IS_SET, AdvanceOperator::IS_NOT_NULL => $q->whereNotNull($col),
                            AdvanceOperator::IS_NOT_SET, AdvanceOperator::IS_NULL => $q->whereNull($col),
                            default => null,
                        };
                    });
                }

                return match ($operator) {
                    AdvanceOperator::IS_SET, AdvanceOperator::IS_NOT_NULL => $query->whereNotNull($this->property),
                    AdvanceOperator::IS_NOT_SET, AdvanceOperator::IS_NULL => $query->whereNull($this->property),
                    default => $query,
                };
            }

            private function splitPath(string $property): array
            {
                $parts = explode('.', $property);
                $col = array_pop($parts);

                return [implode('.', $parts), $col];
            }

            private function dayBounds(string $start, string $end): array
            {
                $start = trim($start).' 00:00:00';
                $end = trim($end).' 23:59:59';

                return [$start, $end];
            }
        };
    }

    public function default(mixed $value): static
    {
        if (is_array($value)) {
            $this->default = array_map(fn ($v) => $this->formatValue($v), $value);
        } else {
            $this->default = $this->formatValue($value);
        }
        $this->hasDefaultValue = true;

        return $this;
    }

    protected function formatValue($value): string
    {
        if ($value instanceof \Carbon\Carbon) {
            return $value->format($this->format);
        }
        if (is_int($value) || is_string($value)) {
            return \Carbon\Carbon::parse($value)->format($this->format);
        }

        return (string) $value;
    }
}
