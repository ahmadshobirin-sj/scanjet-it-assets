<?php

namespace App\Tables\Traits;

trait TableState
{
    protected array $state = [];

    public function applyStateFromRequest(): void
    {

        $this->state['filters'] = request()->query('filter', $this->defaultFilters());
        $this->state['sort'] = self::parseSort(request()->query('sort', implode(',', $this->defaultSort())));
        $this->state['page'] = (int) request()->query('page', $this->pagination()['page']);
        $this->state['per_page'] = (int) request()->query('per_page', $this->pagination()['per_page']);
    }

    public function getState(?string $key = null, mixed $default = null): mixed
    {
        if ($this->state === []) {
            $this->applyStateFromRequest();
        }
        if ($key === null) {
            return $this->state;
        }

        return $this->state[$key] ?? $default;
    }

    public function setState(string $key, mixed $value): void
    {
        $this->state[$key] = $value;
    }

    private static function parseSort(string $sort): array
    {
        return array_filter(explode(',', $sort));
    }
}
