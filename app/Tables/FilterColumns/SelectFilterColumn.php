<?php

namespace App\Tables\FilterColumns;

use App\Helpers\ClosureHelper;
use App\Tables\Enums\AdvanceOperator;
use Closure;

class SelectFilterColumn extends FilterColumn
{
    protected array|Closure $options = [];

    protected bool $multiple = false;

    protected function setDefaultClauses(): void
    {
        $operators = AdvanceOperator::selectOperators();

        $this->clauses = array_map(
            fn (AdvanceOperator $op) => [
                'label' => $op->label(),
                'value' => $op->value,
            ],
            $operators
        );

        $this->defaultClause = AdvanceOperator::EQUALS->value;
    }

    public function options(array|Closure $options): static
    {
        $this->options = $options;

        return $this;
    }

    public function multiple(bool $multiple = true): static
    {
        $this->multiple = $multiple;
        if ($multiple) {
            $this->defaultClause = AdvanceOperator::IN->value;
        }

        return $this;
    }

    public function getOptions(): array
    {
        $options = ClosureHelper::evaluate($this->options);

        // If options is a model class string, fetch from model
        if (is_string($options) && class_exists($options)) {
            $modelClass = $options;

            return $modelClass::query()
                ->select(['id as value', 'name as label'])
                ->orderBy('name')
                ->get()
                ->toArray();
        }

        return $options;
    }

    public function getType(): string
    {
        return 'set';
    }

    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            'options' => $this->getOptions(),
            'multiple' => $this->multiple,
        ]);
    }
}
