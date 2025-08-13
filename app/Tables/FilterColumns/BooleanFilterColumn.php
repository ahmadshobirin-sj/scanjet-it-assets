<?php

namespace App\Tables\FilterColumns;

use App\Tables\Enums\AdvanceOperator;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;

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
                // Handle simple boolean value
                if (is_bool($value) || in_array($value, ['true', 'false', '1', '0', 1, 0])) {
                    $boolValue = filter_var($value, FILTER_VALIDATE_BOOLEAN);

                    return $query->where($this->property, '=', $boolValue);
                }

                // Handle operator format
                if (! is_array($value) || ! isset($value['op'])) {
                    return $query;
                }

                $operator = $value['op'] ?? null;

                if (! $operator) {
                    return $query;
                }

                try {
                    $operatorEnum = AdvanceOperator::from($operator);
                } catch (\ValueError $e) {
                    return $query;
                }

                return match ($operatorEnum) {
                    AdvanceOperator::IS_TRUE => $query->where($this->property, '=', true),
                    AdvanceOperator::IS_FALSE => $query->where($this->property, '=', false),
                    default => $query,
                };
            }
        };
    }
}
