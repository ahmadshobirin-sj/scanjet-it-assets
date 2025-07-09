<?php

namespace App\DTOs;

use Illuminate\Http\Request;

class TableStateDTO
{
    protected array $sort;
    protected array $filters;
    protected int $perPage;
    protected int $page;

    public function __construct(
        array $sort = ['-created_at'],
        array $filters = [],
        int $perPage = 10,
        int $page = 1,
    ) {
        $this->sort = $sort;
        $this->filters = $filters;
        $this->perPage = $perPage;
        $this->page = $page;
    }

    public static function fromRequest(Request $request, array $defaults = []): self
    {
        $defaults = array_merge([
            'sort' => ['-created_at'],
            'filters' => [],
            'per_page' => 10,
            'page' => 1,
        ], $defaults);

        return new self(
            sort: self::parseSort($request->input('sort', implode(',', $defaults['sort']))),
            filters: $request->input('filter', $defaults['filters']),
            perPage: (int) $request->input('per_page', $defaults['per_page']),
            page: (int) $request->input('page', $defaults['page']),
        );
    }

    private static function parseSort(string $sort): array
    {
        return array_filter(explode(',', $sort));
    }

    public function toArray(): array
    {
        return [
            'sort' => $this->sort,
            'filters' => $this->filters,
            'per_page' => $this->perPage,
            'page' => $this->page,
        ];
    }

    // Getters
    public function getSort(): array
    {
        return $this->sort;
    }

    public function getFilters(): array
    {
        return $this->filters;
    }

    public function getPerPage(): int
    {
        return $this->perPage;
    }

    public function getPage(): int
    {
        return $this->page;
    }

    // Setters
    public function setSort(array $sort): self
    {
        $this->sort = $sort;
        return $this;
    }

    public function setFilters(array $filters): self
    {
        $this->filters = $filters;
        return $this;
    }

    public function setPerPage(int $perPage): self
    {
        $this->perPage = $perPage;
        return $this;
    }

    public function setPage(int $page): self
    {
        $this->page = $page;
        return $this;
    }
}
