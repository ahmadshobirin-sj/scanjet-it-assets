<?php

namespace App\Tables\FilterColumns;

use App\Helpers\ClosureHelper;
use App\Tables\Enums\AdvanceOperator;
use App\Tables\Supports\AdvancedFilter;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\Filters\Filter;

/**
 * FilterColumn (base)
 * -------------------
 * - Menyediakan API umum untuk semua filter kolom.
 * - Mendukung "connectionHints" agar AdvancedFilter bisa melakukan cross-connection lookup
 *   (akan dipakai oleh AdvancedFilter versi lanjutan).
 */
abstract class FilterColumn
{
    protected string|Closure $name;

    protected string|Closure|null $label = null;

    protected mixed $default = null;

    protected Filter|Closure|null $customFilter = null;

    /** @var array daftar opsi operator untuk FE: [['label'=>..., 'value'=>...], ...] */
    protected array $clauses = [];

    protected string $defaultClause;

    protected bool $allowNested = false;

    protected bool $hasDefaultValue = false;

    /**
     * Hint untuk filter lintas koneksi tabel
     * Bentuk umum (opsional, fleksibel sesuai kebutuhan AdvancedFilter):
     * [
     *   // key spesifik attribute atau prefix path
     *   'current_assignment.assigned_user.name' => [
     *       'strategy'   => 'exists',       // atau 'in'
     *       'connection' => 'mysql_crm',
     *       'table'      => 'users',
     *       'local_key'  => 'assigned_user_id', // kolom di tabel relasi/akar yang dibandingkan
     *       'foreign_key'=> 'id',               // kolom di table external
     *       'column'     => 'name',             // kolom yang difilter di table external
     *       // opsional: 'wrap_with' => callback untuk menambah join/constraint terkait
     *   ],
     *   // dst...
     * ]
     */
    protected array $connectionHints = [];

    public function __construct(string|Closure $name)
    {
        $this->name = $name;
        $this->setDefaultClauses();
    }

    abstract protected function setDefaultClauses(): void;

    public static function make(string|Closure $name): static
    {
        return new static($name);
    }

    // ── Getters ─────────────────────────────────────────────────────────────────

    public function getName(): string
    {
        return ClosureHelper::evaluate($this->name);
    }

    public function getLabel(): ?string
    {
        return ClosureHelper::evaluate($this->label) ?? $this->getName();
    }

    public function getDefault(): mixed
    {
        return ClosureHelper::evaluate($this->default);
    }

    public function getCustomFilter(): Filter|Closure|null
    {
        return ClosureHelper::evaluate($this->customFilter);
    }

    public function getClauses(): array
    {
        return $this->clauses;
    }

    public function getDefaultClause(): string
    {
        return $this->defaultClause;
    }

    public function isNested(): bool
    {
        return $this->allowNested;
    }

    public function hasDefaultValue(): bool
    {
        return $this->hasDefaultValue;
    }

    /** Ambil connection hints yang terpasang pada kolom ini */
    public function getConnectionHints(): array
    {
        return $this->connectionHints;
    }

    // ── Setters & fluent ────────────────────────────────────────────────────────

    public function label(string|Closure $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function default(mixed $value): static
    {
        $this->default = $value;
        $this->hasDefaultValue = true;

        return $this;
    }

    public function clauses(array $clauses): static
    {
        $this->clauses = $clauses;

        return $this;
    }

    public function defaultClause(string $clause): static
    {
        $this->defaultClause = $clause;

        return $this;
    }

    public function nested(bool $allow = true): static
    {
        $this->allowNested = $allow;

        return $this;
    }

    public function customFilter(Filter|Closure $filter): static
    {
        $this->customFilter = $filter;

        return $this;
    }

    /**
     * Pasang connection hints (opsional).
     * Lihat $connectionHints di atas untuk bentuk umum.
     */
    public function connectionHints(array $hints): static
    {
        $this->connectionHints = $hints;

        return $this;
    }

    // ── Introspection ───────────────────────────────────────────────────────────

    abstract public function getType(): string;

    public function toArray(): array
    {
        return [
            'type' => $this->getType(),
            'attribute' => $this->getName(),
            'label' => $this->getLabel(),
            'clauses' => $this->getClauses(),
            'meta' => $this->getMeta(),
            'hasDefaultValue' => $this->hasDefaultValue(),
        ];
    }

    /**
     * Metadata opsional untuk FE (override bila perlu).
     */
    protected function getMeta(): ?array
    {
        return null;
    }

    /**
     * Build AllowedFilter untuk Spatie.
     * - Jika ada customFilter (Filter/Closure), pakai itu.
     * - Default: AdvancedFilter (generic) — saat ini belum menggunakan connectionHints,
     *   tetapi sudah disiapkan API-nya agar AdvancedFilter versi lanjutan dapat memanfaatkannya.
     */
    public function getAllowedFilter(): AllowedFilter
    {
        if ($this->getCustomFilter() instanceof Filter) {
            return AllowedFilter::custom($this->getName(), $this->getCustomFilter());
        }

        if ($this->getCustomFilter() instanceof Closure) {
            return AllowedFilter::custom($this->getName(), $this->getCustomFilter());
        }

        // Default to AdvancedFilter (generic)
        // (Jika kamu sudah update AdvancedFilter menerima $hints, ganti ctor di bawah menjadi:
        //   new AdvancedFilter($this->getName(), $this->connectionHints)
        // )
        return AllowedFilter::custom($this->getName(), $this->createFilter());
    }

    /**
     * Buat instance filter untuk kolom ini.
     * Override di child untuk perilaku khusus type (Text/Date/Numeric/Boolean).
     */
    protected function createFilter(): Filter|Closure
    {
        return new AdvancedFilter($this->getName());
    }

    // ── (Opsional) Helper generik jika child ingin delegasi langsung ────────────

    protected function applyFilter(Builder $query, $value, string $property): Builder
    {
        if (! is_array($value) || ! isset($value['op'])) {
            return $query;
        }

        $operator = $value['op'] ?? null;
        $filterValue = $value['value'] ?? null;

        if (! $operator) {
            return $query;
        }

        try {
            $operatorEnum = AdvanceOperator::from($operator);
        } catch (\ValueError $e) {
            return $query;
        }

        return $this->applyOperator($query, $property, $operatorEnum, $filterValue);
    }

    protected function applyOperator(Builder $query, string $column, AdvanceOperator $operator, $value): Builder
    {
        return match ($operator) {
            AdvanceOperator::EQUALS => $query->where($column, '=', $value),
            AdvanceOperator::NOT_EQUALS => $query->where($column, '!=', $value),
            AdvanceOperator::IS_NULL => $query->whereNull($column),
            AdvanceOperator::IS_NOT_NULL => $query->whereNotNull($column),
            default => $query,
        };
    }
}
