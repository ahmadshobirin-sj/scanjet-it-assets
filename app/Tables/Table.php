<?php

namespace App\Tables;

use App\Tables\Columns\Column;
use App\Tables\FilterColumns\FilterColumn;
use App\Tables\Traits\HasFilter;
use App\Tables\Traits\HasGlobalSearch;
use App\Tables\Traits\HasRowSelection;
use App\Tables\Traits\HasSortable;
use App\Tables\Traits\HasToggleable;
use App\Tables\Traits\TableState;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * Table (kernel)
 * --------------
 * Mesin generik untuk membangun tabel berbasis Spatie QueryBuilder:
 * - Filter (custom & advanced)
 * - Global Search (nested/pivot/cross-connection via engine)
 * - Sort (akan di-wire di trait HasSortable batch berikutnya)
 * - Toggleable columns, pagination, preset, export, dsb.
 */
abstract class Table
{
    use HasFilter;
    use HasGlobalSearch;
    use HasRowSelection;
    use HasSortable;
    use HasToggleable;
    use TableState;

    /** Nama instance tabel untuk namespacing state di request */
    protected string $name = 'default';

    /** Kolom PK baris pada hasil */
    protected string $rowId = 'id';

    /** Teks saat kosong */
    protected string $emptyText = 'No data available';

    /** Query utama yang sudah diwrap oleh Spatie QueryBuilder */
    protected QueryBuilder|string $query;

    /** Query mentah (tanpa pagination) - untuk export/raw */
    protected QueryBuilder|string $rawQuery;

    /** Data hasil eksekusi paginated */
    protected LengthAwarePaginator $rawData;

    /** @var null|callable Hook kustom untuk memodifikasi QueryBuilder (runtime) */
    protected $customQueryHook = null;

    public function __construct(string $name)
    {
        $this->name = $name;

        // Build query 1x
        $this->query = $this->makeQuery();

        // Simpan rawQuery utk export/raw (sebelum pagination)
        $this->rawQuery = clone $this->query;

        // Eksekusi paginate + simpan
        $this->rawData = $this->makeData($this->query);

        // Apply state dari request (page, sort, filters) → berguna untuk toSchema()
        $this->applyStateFromRequest();
    }

    /** Factory sederhana */
    public static function make(?string $name = null): static
    {
        return new static($name ?? 'default');
    }

    // ------- Kontrak dasar yang wajib di-override -------

    /** Resource Eloquent Builder atau FQCN Model */
    abstract public function resource(): Builder|string;

    /** Definisi kolom-kolom tabel (array of Column) */
    abstract public function columns(): array;

    /** Definisi filter (array of FilterColumn) */
    abstract public function filters(): array;

    /** Relasi yang ingin di-eager load */
    public function with(): array
    {
        return [];
    }

    /** Default pagination */
    public function pagination(): array
    {
        return [
            'per_page' => 10,
            'page' => 1,
        ];
    }

    // ------- Getter basic -------

    public function getName(): string
    {
        return $this->name;
    }

    public function getRowId(): string
    {
        return $this->rowId;
    }

    public function getEmptyText(): string
    {
        return $this->emptyText;
    }

    // ------- Hook koneksi lintas DB (opsional override di turunan) -------

    /**
     * filterConnectionHints
     * ---------------------
     * Petakan path relasi → nama koneksi, mis:
     * ['assignments.assigned_user' => 'mysql_crm']
     * Digunakan oleh layer filter (akan dipass dari trait HasFilter pada batch selanjutnya).
     */
    protected function filterConnectionHints(): array
    {
        return [];
    }

    /**
     * sortConnectionHints
     * -------------------
     * Petakan path relasi → nama koneksi untuk kebutuhan sorting nested/pivot.
     * Akan dipakai oleh trait HasSortable (batch berikutnya).
     */
    protected function sortConnectionHints(): array
    {
        return [];
    }

    protected function supportsWindowFunctions(?string $connection = null): bool
    {
        try {
            $conn = $connection ? DB::connection($connection) : DB::connection();
            $driver = $conn->getDriverName(); // mysql|pgsql|sqlsrv|sqlite
            $version = (string) ($conn->getPdo()->getAttribute(\PDO::ATTR_SERVER_VERSION) ?? '');

            switch ($driver) {
                case 'mysql':
                    // MySQL 8+: ada window functions
                    // MariaDB 10.2+ juga punya
                    if (stripos($version, 'mariadb') !== false) {
                        if (preg_match('/(\d+\.\d+\.\d+)/i', $version, $m)) {
                            return version_compare($m[1], '10.2.0', '>=');
                        }

                        return true; // bila versi tak terbaca, asumsikan ya (opsional: set false kalau mau konservatif)
                    }

                    return version_compare($version, '8.0.0', '>=');

                case 'pgsql':
                    return true; // PostgreSQL sudah lama mendukung

                case 'sqlsrv':
                    return true; // SQL Server mendukung

                case 'sqlite':
                    // SQLite 3.25.0+ (2018) mendukung window functions
                    if (preg_match('/(\d+\.\d+\.\d+)/', $version, $m)) {
                        return version_compare($m[1], '3.25.0', '>=');
                    }

                    // jika versi tak bisa dibaca, konservatif: false
                    return false;

                default:
                    return false;
            }
        } catch (\Throwable $e) {
            return false; // jika gagal deteksi, fallback aman
        }
    }

    // ------- Query Builder lifecycle -------

    /**
     * Build dan kembalikan QueryBuilder (belum dipaginate).
     * - Terapkan withCount untuk count-column sebelum masuk ke Spatie QB
     * - allowedFilters/Sorts/Fields
     * - Eager load relasi
     * - Hook customizeQuery()
     */
    public function makeQuery()
    {
        // --- Ambil state aktif ---
        $activeFilters = $this->getActiveFilters();
        $currentSort = $this->getState('sort', $this->defaultSort());

        // Susun query params "bersih" utk Spatie
        $queryParams = [];

        if (! empty($activeFilters)) {
            foreach ($activeFilters as $attribute => $filter) {
                $queryParams['filter'][$attribute] = $filter;
            }
        }

        if (! empty($currentSort)) {
            $queryParams['sort'] = implode(',', $currentSort);
        }

        // Global search (opsional)
        if ($search = $this->getState('search')) {
            $queryParams['filter']['search'] = $search;
        }

        // Buat request palsu untuk Spatie QB
        $request = request()->duplicate($queryParams);

        // --- Resource awal (Eloquent\Builder) ---
        $resource = $this->resource();
        if (is_string($resource) && class_exists($resource)) {
            $baseQuery = $resource::query();
        } else {
            $baseQuery = $resource;
        }

        // --- Terapkan withCount / self-count lebih dini (alias dipakai utk sort/filter/HAVING) ---
        foreach ($this->columns() as $column) {
            if ($column->isCountColumn()) {
                $countConfig = $column->getCountConfig();   // ['relation','column','conditions','distinct']
                $countAlias = $column->getName();

                if ($countConfig['relation'] !== 'self') {
                    // Count pada relasi: gunakan withCount + kondisi
                    if ($countConfig['relation'] !== 'self') {
                        $relation = $countConfig['relation'];
                        $alias = $countAlias;

                        if ($countConfig['distinct'] && $countConfig['column']) {
                            // DISTINCT: definisikan ekspresi COUNT(DISTINCT ...) di closure
                            $baseQuery->withCount([
                                "{$relation} as {$alias}" => function ($q) use ($countConfig) {
                                    // kondisi tambahan (opsional)
                                    if ($countConfig['conditions']) {
                                        foreach ($countConfig['conditions'] as $field => $value) {
                                            is_array($value) ? $q->whereIn($field, $value) : $q->where($field, $value);
                                        }
                                    }
                                    $q->selectRaw("COUNT(DISTINCT {$countConfig['column']})");
                                },
                            ]);
                        } else {
                            // NON-DISTINCT: JANGAN panggil select(); biarkan withCount hitung COUNT(*)
                            $baseQuery->withCount([
                                "{$relation} as {$alias}" => function ($q) use ($countConfig) {
                                    if ($countConfig['conditions']) {
                                        foreach ($countConfig['conditions'] as $field => $value) {
                                            is_array($value) ? $q->whereIn($field, $value) : $q->where($field, $value);
                                        }
                                    }
                                    // ❌ jangan panggil $q->select(...)
                                    // ✅ biarkan withCount menghasilkan COUNT(*)
                                },
                            ]);
                        }
                    }
                } else {
                    // Count pada tabel sendiri (dataset-level): window function kalau ada, else selectSub
                    $model = $baseQuery->getModel();
                    $table = $model->getTable();
                    $colRef = $countConfig['column'] ? "{$table}.{$countConfig['column']}" : '*';
                    $expr = $countConfig['distinct'] && $countConfig['column']
                        ? "COUNT(DISTINCT {$colRef})"
                        : "COUNT({$colRef})";

                    if ($this->supportsWindowFunctions()) {
                        // Nilai sama di semua baris halaman (global), efisien & rapi
                        $baseQuery->selectRaw("{$expr} OVER() as {$countAlias}");
                    } else {
                        // Fallback portable tanpa window function
                        $baseQuery->selectSub(function ($q) use ($table, $expr) {
                            $q->from($table)->selectRaw($expr);
                        }, $countAlias);
                    }
                }
            }
        }

        // --- Build allowed filters & sorts ---
        $allowedFilters = $this->buildFilters();
        $allowedSorts = $this->sorts();

        // --- Bungkus dengan Spatie QueryBuilder ---
        /** @var \Spatie\QueryBuilder\QueryBuilder $query */
        $query = \Spatie\QueryBuilder\QueryBuilder::for($baseQuery, $request)
            ->allowedFilters($allowedFilters)
            ->allowedSorts($allowedSorts);

        // Eager load relasi
        if (! empty($this->with())) {
            $query->with($this->with());
        }

        // Toggleable fields → allowedFields
        $toggleableFields = $this->toggleableColumns();
        if (! empty($toggleableFields)) {
            $query->allowedFields($toggleableFields);
        }

        // Hook akhir (overrideable)
        $query = $this->customizeQuery($query);

        // Hook runtime: Table::make()->customQuery(fn($q) => ...)
        if (is_callable($this->customQueryHook ?? null)) {
            $result = call_user_func($this->customQueryHook, $query);
            if ($result instanceof \Spatie\QueryBuilder\QueryBuilder) {
                $query = $result;
            }
        }

        return $query;
    }

    /**
     * Eksekusi pagination + appends query string untuk navigasi front-end.
     */
    public function makeData(QueryBuilder $query): LengthAwarePaginator
    {
        $page = $this->getState('page', $this->pagination()['page']);
        $perPage = $this->getState('perPage', $this->pagination()['per_page']);

        $results = $query->paginate(perPage: $perPage, page: $page);
        $results->appends($this->buildPaginationParams());

        return $results;
    }

    /**
     * Build daftar allowed filters (gabungan: filter columns + global search)
     */
    protected function buildFilters(): array
    {
        $filters = [];

        // Filter columns (akan memakai AdvancedFilter sebagai default)
        $filterColumns = $this->filterResolver();
        if (! empty($filterColumns)) {
            $filters = array_merge($filters, $filterColumns);
        }

        // Global search
        $globalSearch = $this->globalSearchResolver();
        if (! empty($globalSearch)) {
            $filters = array_merge($filters, $globalSearch);
        }

        return array_filter($filters, fn ($item) => filled($item));
    }

    /**
     * Susun parameter query string untuk pagination links.
     */
    protected function buildPaginationParams(): array
    {
        $params = [];
        $tableName = $this->getName();

        foreach ($this->getActiveFilters() as $attribute => $filter) {
            $params["{$tableName}[filter][{$attribute}][op]"] = $filter['op'];

            if (is_array($filter['value'])) {
                foreach ($filter['value'] as $index => $value) {
                    $params["{$tableName}[filter][{$attribute}][value][{$index}]"] = $value;
                }
            } else {
                $params["{$tableName}[filter][{$attribute}][value]"] = $filter['value'];
            }
        }

        if ($search = $this->getState('search')) {
            $params["{$tableName}[search]"] = $search;
        }

        $sorts = $this->getState('sort', []);
        if (! empty($sorts)) {
            $params["{$tableName}[sort]"] = implode(',', $sorts);
        }

        $params["{$tableName}[page]"] = $this->getState('page', $this->pagination()['page']);
        $params["{$tableName}[per_page]"] = $this->getState('perPage', $this->pagination()['per_page']);

        return $params;
    }

    /**
     * Hook untuk kustomisasi query terakhir (override di turunan).
     */
    protected function customizeQuery(QueryBuilder $query): QueryBuilder
    {
        return $query;
    }

    /**
     * customQuery
     * ----------
     * Pasang hook runtime untuk memodifikasi QueryBuilder.
     * - Callback boleh mengembalikan QueryBuilder baru ATAU hanya memodifikasi by reference.
     * - Setelah dipasang, kita REBUILD query & data agar hook ikut terpakai.
     */
    public function customQuery(callable $callback): static
    {
        $this->customQueryHook = $callback;

        // rebuild supaya hook langsung terpakai
        $this->query = $this->makeQuery();
        $this->rawQuery = clone $this->query;
        $this->rawData = $this->makeData($this->query);

        return $this;
    }

    /** Alias nama lain bila suka gaya setter */
    public function setCustomQuery(callable $callback): static
    {
        return $this->customQuery($callback);
    }

    // ------- Mapping Schema untuk FE -------

    /** Peta Column objects → schema FE */
    public function mapColumnsToSchema(): array
    {
        return array_reduce($this->columns(), function ($carry, Column $column) {
            if ($column->isHidden()) {
                return $carry;
            }
            $carry[] = $column->toSchema();

            return $carry;
        }, []);
    }

    /** Peta FilterColumn objects → schema FE */
    public function mapFiltersToSchema(): array
    {
        return $this->getFiltersArray();
    }

    /** Paket lengkap schema tabel untuk FE */
    public function toSchema(): array
    {
        return [
            'name' => $this->getName(),
            'rowId' => $this->getRowId(),
            'emptyText' => $this->getEmptyText(),
            'enableRowSelection' => $this->isRowSelectionEnabled(),
            'columns' => $this->mapColumnsToSchema(),
            'filters' => $this->mapFiltersToSchema(),
            'state' => $this->getFullState(),
            'results' => $this->getData(),
            'meta' => [
                'has_filters' => $this->hasActiveFilters(),
                'filter_summary' => $this->getFilterSummary(),
                'filter_count' => $this->countActiveFilters(),
                'sortable_columns' => $this->getSortableColumnNames(),
                'toggleable_columns' => $this->toggleableColumns(),
                'default_sort' => $this->defaultSort(),
                'searchable_columns' => $this->getSearchableColumns(),
                'per_page_options' => $this->perPageOptions(),
            ],
        ];
    }

    public function perPageOptions(): array
    {
        return [
            ['label' => '10',  'value' => 10],
            ['label' => '25',  'value' => 25],
            ['label' => '50',  'value' => 50],
            ['label' => '100', 'value' => 100],
            ['label' => 'All', 'value' => $this->rawData->total()],
        ];
    }

    /** Kolom yang diikutkan di global search */
    protected function getSearchableColumns(): array
    {
        return collect($this->columns())
            ->filter(fn (Column $col) => $col->isGlobalSearchable())
            ->map(fn (Column $col) => $col->getName())
            ->values()
            ->all();
    }

    // ------- Data Helpers -------

    /** Hanya data paginated (tanpa schema) */
    public function getData(): array
    {
        return $this->rawData->toArray();
    }

    /** Debugging helper */
    public function debugQuery(): array
    {
        $activeFilters = $this->getActiveFilters();
        $currentSort = $this->getState('sort', $this->defaultSort());

        $queryParams = [];
        if (! empty($activeFilters)) {
            foreach ($activeFilters as $attribute => $filter) {
                $queryParams['filter'][$attribute] = $filter;
            }
        }
        if (! empty($currentSort)) {
            $queryParams['sort'] = implode(',', $currentSort);
        }

        return [
            'table_name' => $this->getName(),
            'state' => $this->getState(),
            'active_filters' => $activeFilters,
            'query_params' => $queryParams,
            'request_input' => request()->input($this->getName()),
            'raw_request' => request()->all(),
            'sql' => $this->query->toSql(),
            'bindings' => $this->query->getBindings(),
            'count' => $this->rawData->total(),
        ];
    }

    /** Reset semua state ke default */
    public function reset(): void
    {
        $this->clearFilters();
        $this->setState('search', null);
        $this->setState('sort', $this->defaultSort());
        $this->setState('page', 1);
        $this->setState('perPage', $this->pagination()['per_page']);
    }

    /** Export semua data (tanpa pagination) */
    public function export(): array
    {
        return $this->rawQuery->get()->toArray();
    }

    /** Apply preset konfigurasi (filters, sort, perPage, search) */
    public function applyPreset(array $preset): void
    {
        if (isset($preset['filters'])) {
            $this->applyFilters($preset['filters']);
        }

        if (isset($preset['sort'])) {
            $this->setState('sort', is_array($preset['sort']) ? $preset['sort'] : [$preset['sort']]);
        }

        if (isset($preset['perPage'])) {
            $this->setState('perPage', $preset['perPage']);
        }

        if (isset($preset['search'])) {
            $this->setState('search', $preset['search']);
        }
    }

    /** Response full schema */
    public function toResponse(): \Illuminate\Http\JsonResponse
    {
        return response()->json($this->toSchema());
    }

    /** Response hanya data */
    public function dataResponse(): \Illuminate\Http\JsonResponse
    {
        return response()->json($this->getData());
    }

    /** Apakah ada data? */
    public function hasData(): bool
    {
        $data = $this->getData();

        return isset($data['data']) && count($data['data']) > 0;
    }

    /** Total count (tanpa pagination) */
    public function getTotalCount(): int
    {
        return $this->query->count();
    }

    /** Filtered count = total (karena filter sudah diquery) */
    public function getFilteredCount(): int
    {
        return $this->getTotalCount();
    }

    /** Clone table beserta state */
    public function clone(): static
    {
        $cloned = new static($this->name);
        $cloned->state = $this->state;

        return $cloned;
    }

    /** Set banyak state sekaligus */
    public function setStates(array $states): void
    {
        foreach ($states as $key => $value) {
            $this->setState($key, $value);
        }
    }

    /** Ringkasan cepat state tabel */
    public function getSummary(): array
    {
        return [
            'table' => $this->getName(),
            'total_records' => $this->getTotalCount(),
            'filters_applied' => $this->countActiveFilters(),
            'current_page' => $this->getState('page', 1),
            'per_page' => $this->getState('perPage', $this->pagination()['per_page']),
            'sort' => $this->getState('sort', []),
            'search' => $this->getState('search'),
            'has_data' => $this->hasData(),
        ];
    }

    /** Hapus semua state ke default */
    public function clearAll(): void
    {
        $this->reset();
        $this->state = [];
        $this->applyStateFromRequest();
    }

    /** URL statefull untuk FE */
    public function getUrl(string $baseUrl = ''): string
    {
        $params = $this->buildPaginationParams();
        $queryString = http_build_query($params);

        return $baseUrl.(str_contains($baseUrl, '?') ? '&' : '?').$queryString;
    }

    /** Apply state dari URL string */
    public function applyFromUrl(string $url): void
    {
        $parsedUrl = parse_url($url);

        if (isset($parsedUrl['query'])) {
            parse_str($parsedUrl['query'], $params);

            $tableName = $this->getName();
            $tableParams = $params[$tableName] ?? $params;

            if (isset($tableParams['filter'])) {
                foreach ($tableParams['filter'] as $attribute => $filter) {
                    if ($attribute === 'search') {
                        $this->setState('search', $filter);
                    } elseif (is_array($filter) && isset($filter['op'])) {
                        $this->applyFilter($attribute, $filter['value'] ?? null, $filter['op']);
                    }
                }
            }

            if (isset($tableParams['sort'])) {
                $this->setState('sort', self::parseSort($tableParams['sort']));
            }

            if (isset($tableParams['per_page'])) {
                $this->setState('perPage', (int) $tableParams['per_page']);
            }

            if (isset($tableParams['page'])) {
                $this->setState('page', (int) $tableParams['page']);
            }
        }
    }

    /** Preset bawaan */
    public function getPresets(): array
    {
        return [
            'default' => [
                'name' => 'Default',
                'filters' => [],
                'sort' => $this->defaultSort(),
                'perPage' => $this->pagination()['per_page'],
            ],
            'all' => [
                'name' => 'All Records',
                'filters' => [],
                'sort' => $this->defaultSort(),
                'perPage' => 9999,
            ],
        ];
    }

    /** Load preset by name */
    public function loadPreset(string $presetName): void
    {
        $presets = $this->getPresets();

        if (isset($presets[$presetName])) {
            $this->applyPreset($presets[$presetName]);
        }
    }

    /** Konfigurasi kolom untuk FE (ringkas) */
    public function getColumnsConfig(): array
    {
        return collect($this->columns())
            ->map(fn (Column $column) => [
                'name' => $column->getName(),
                'label' => $column->getLabel(),
                'sortable' => $column->isSortable(),
                'searchable' => $column->isGlobalSearchable(),
                'toggleable' => $column->isToggleable(),
                'hidden' => $column->isHidden(),
            ])
            ->toArray();
    }

    /** Konfigurasi filter untuk FE (ringkas) */
    public function getFiltersConfig(): array
    {
        return $this->getFiltersArray();
    }

    /** Validasi konfigurasi dasar */
    public function validate(): array
    {
        $errors = [];

        try {
            $resource = $this->resource();
            if (is_string($resource) && ! class_exists($resource)) {
                $errors[] = "Resource class {$resource} does not exist";
            }
        } catch (\Exception $e) {
            $errors[] = 'Error loading resource: '.$e->getMessage();
        }

        if (empty($this->columns())) {
            $errors[] = 'No columns defined';
        }

        $sortableColumns = $this->getSortableColumnNames();
        $defaultSort = $this->defaultSort();
        foreach ($defaultSort as $sort) {
            $column = ltrim($sort, '-');
            if (! in_array($column, $sortableColumns)) {
                $errors[] = "Default sort column '{$column}' is not sortable";
            }
        }

        return $errors;
    }

    /** Metadata ringkas */
    public function getMetadata(): array
    {
        return [
            'name' => $this->getName(),
            'resource' => is_string($this->resource()) ? $this->resource() : get_class($this->resource()->getModel()),
            'columns_count' => count($this->columns()),
            'filters_count' => count($this->filters()),
            'sortable_columns' => $this->getSortableColumnNames(),
            'searchable_columns' => $this->getSearchableColumns(),
            'toggleable_columns' => $this->toggleableColumns(),
            'default_sort' => $this->defaultSort(),
            'default_pagination' => $this->pagination(),
            'has_relationships' => ! empty($this->with()),
            'relationships' => $this->with(),
        ];
    }

    /** Statistik cepat */
    public function getStats(): array
    {
        $data = $this->getData();

        return [
            'current_page' => $data['current_page'] ?? 1,
            'last_page' => $data['last_page'] ?? 1,
            'per_page' => $data['per_page'] ?? $this->pagination()['per_page'],
            'total' => $data['total'] ?? 0,
            'from' => $data['from'] ?? 0,
            'to' => $data['to'] ?? 0,
            'filters_active' => $this->countActiveFilters(),
            'has_more_pages' => ($data['current_page'] ?? 1) < ($data['last_page'] ?? 1),
        ];
    }
}
