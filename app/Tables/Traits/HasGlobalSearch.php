<?php

namespace App\Tables\Traits;

use App\Http\Filters\GlobalSearchNew;
use App\Tables\Columns\Column;
use Spatie\QueryBuilder\AllowedFilter;

trait HasGlobalSearch
{
    /**
     * globalSearchResolver
     * --------------------
     * Membangun AllowedFilter 'search' untuk Spatie QueryBuilder.
     * - Ambil daftar kolom yang diberi flag ->globallySearchable(true)
     * - Ambil count columns yang diberi flag ->searchableCount(true)
     * - Pass connection hints (opsional)
     */
    public function globalSearchResolver(): array
    {
        $searchableColumns = $this->getGlobalSearchableColumns();
        if (empty($searchableColumns) && empty($this->getSearchableCountAliases())) {
            return [];
        }

        // nama kolom (string) dari Column instances
        $columnNames = array_map(
            fn ($col) => $col instanceof Column ? $col->getName() : (string) $col,
            $searchableColumns
        );

        // alias count columns yang boleh di-search via HAVING
        $countAliases = $this->getSearchableCountAliases();

        // hints koneksi untuk relasi tertentu (override di child table jika perlu)
        $hints = $this->globalSearchConnectionHints();

        return [
            AllowedFilter::custom(
                'search',
                new GlobalSearchNew($columnNames, $countAliases, $hints)
            ),
        ];
    }

    /**
     * getGlobalSearchableColumns
     * --------------------------
     * Hanya mengembalikan kolom yang:
     *  - diberi flag ->globallySearchable(true)
     *  - BUKAN count column (count column ditangani tersendiri via HAVING)
     */
    protected function getGlobalSearchableColumns(): array
    {
        return collect($this->columns())
            ->filter(fn (Column $col) => $col->isGlobalSearchable() && ! $col->isCountColumn())
            ->all();
    }

    /**
     * getSearchableCountAliases
     * -------------------------
     * Mengembalikan daftar alias kolom COUNT (dari withCount) yang diizinkan
     * untuk dipakai pada pencarian global (via HAVING).
     */
    protected function getSearchableCountAliases(): array
    {
        return collect($this->columns())
            ->filter(fn (Column $col) => $col->isSearchableCount())
            ->map(fn (Column $col) => $col->getName()) // alias count = nama kolom Column::count(...)
            ->values()
            ->all();
    }

    /**
     * globalSearchConnectionHints
     * ---------------------------
     * Override di Table turunan untuk menunjuk koneksi relasi tertentu.
     * Contoh:
     * return [
     *   'assignments.assigned_user' => 'mysql_crm',
     * ];
     */
    protected function globalSearchConnectionHints(): array
    {
        return [];
    }
}
