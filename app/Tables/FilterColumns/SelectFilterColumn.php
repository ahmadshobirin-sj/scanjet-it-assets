<?php

namespace App\Tables\FilterColumns;

use App\Helpers\ClosureHelper;
use App\Tables\Enums\AdvanceOperator;
use App\Tables\Supports\AdvancedFilter;
use Closure;
use Spatie\QueryBuilder\Filters\Filter;

/**
 * SelectFilterColumn
 * ------------------
 * - Cocok untuk enum/status/relasi-id.
 * - FE bisa single/multiple; backend mendukung EQUALS/NOT_EQUALS/IN/NOT_IN.
 * - Query didelegasikan ke AdvancedFilter agar nested & pivot tetap jalan.
 * - Mendukung remote options via HTTP (GET/POST) untuk server-side search.
 */
class SelectFilterColumn extends FilterColumn
{
    /** @var array<int,array{value:mixed,label:string}> Static options (opsional) */
    protected array|Closure $options = [];

    /** @var bool Apakah multi-select */
    protected bool $multiple = false;

    /** @var bool Tampilkan search box di FE (untuk static options) */
    protected bool $searchable = true;

    /** @var ?string Placeholder di FE */
    protected ?string $placeholder = null;

    // ── Remote config (opsional) ───────────────────────────────────────────────
    /** @var ?string URL untuk mengambil options secara remote */
    protected ?string $remoteUrl = null;

    /** @var string HTTP method: GET/POST */
    protected string $remoteMethod = 'GET';

    /** @var string Nama param pencarian (server-side search) */
    protected string $remoteSearchParam = 'q';

    /** @var int Minimal karakter sebelum menembak request */
    protected int $remoteMinChars = 0;

    /** @var int Debounce (ms) untuk request pencarian */
    protected int $remoteDebounceMs = 300;

    /** @var array<string,mixed> Extra query/body params */
    protected array $remoteExtraParams = [];

    /** @var array<string,string> Extra headers */
    protected array $remoteHeaders = [];

    /** @var string Key untuk value dalam item hasil (bisa nested path, mis. "id" atau "data.id") */
    protected string $remoteValueKey = 'id';

    /** @var string Key untuk label dalam item hasil (bisa nested path, mis. "name" atau "attributes.title") */
    protected string $remoteLabelKey = 'name';

    /** @var ?string Path ke array hasil utama di response (mis. "data.items") */
    protected ?string $remoteResultsPath = null;

    /** @var ?string Nama param pagination halaman */
    protected ?string $remotePageParam = 'page';

    /** @var ?string Nama param pagination per halaman */
    protected ?string $remotePerPageParam = 'per_page';

    /** @var ?int Nilai default per halaman (opsional) */
    protected ?int $remotePerPage = null;

    /** @var bool Hint FE boleh cache hasil remote */
    protected bool $remoteCache = true;

    /** @var ?int TTL cache (detik) di FE (hint) */
    protected ?int $remoteCacheTtlSeconds = 300;

    // ── Konfigurasi default operator/select ────────────────────────────────────

    protected function setDefaultClauses(): void
    {
        $ops = AdvanceOperator::selectOperators();

        $this->clauses = array_map(
            fn (AdvanceOperator $op) => [
                'label' => $op->label(),
                'value' => $op->value,
            ],
            $ops
        );

        // Default: single equals (FE boleh kirim array → IN)
        $this->defaultClause = AdvanceOperator::EQUALS->value;
    }

    public function getType(): string
    {
        return 'select';
    }

    // ── Builder (fluent) untuk static/behaviour FE ─────────────────────────────

    /**
     * Set static options: [['value'=>..., 'label'=>...], ...]
     */
    public function options(array|Closure $options): static
    {
        $this->options = ClosureHelper::evaluate($options);

        return $this;
    }

    public function getOptions()
    {
        return $this->options;
    }

    /**
     * Izinkan memilih banyak nilai.
     */
    public function multiple(bool $multiple = true): static
    {
        $this->multiple = $multiple;

        return $this;
    }

    /**
     * Tampilkan kotak pencarian di FE (untuk static options).
     */
    public function searchable(bool $searchable = true): static
    {
        $this->searchable = $searchable;

        return $this;
    }

    /**
     * Placeholder di FE.
     */
    public function placeholder(?string $text): static
    {
        $this->placeholder = $text;

        return $this;
    }

    // ── Builder (fluent) untuk remote options ─────────────────────────────────

    /**
     * Aktifkan remote options dengan URL dan method.
     */
    public function remote(string $url, string $method = 'GET'): static
    {
        $this->remoteUrl = $url;
        $this->remoteMethod = strtoupper($method) === 'POST' ? 'POST' : 'GET';

        return $this;
    }

    /**
     * Konfigurasi pencarian server-side: nama param, min chars, debounce.
     */
    public function remoteSearch(string $param = 'q', int $minChars = 0, int $debounceMs = 300): static
    {
        $this->remoteSearchParam = $param;
        $this->remoteMinChars = max(0, $minChars);
        $this->remoteDebounceMs = max(0, $debounceMs);

        return $this;
    }

    /**
     * Mapping key hasil API: valueKey, labelKey, dan path ke list hasil.
     * - valueKey/labelKey boleh berupa nested path (mis. "data.id").
     * - resultsPath (opsional) jika list bukan root (mis. "data.items").
     */
    public function remoteMap(string $valueKey = 'id', string $labelKey = 'name', ?string $resultsPath = null): static
    {
        $this->remoteValueKey = $valueKey;
        $this->remoteLabelKey = $labelKey;
        $this->remoteResultsPath = $resultsPath;

        return $this;
    }

    /**
     * Extra params (query params untuk GET / body untuk POST).
     */
    public function remoteParams(array $params): static
    {
        $this->remoteExtraParams = $params;

        return $this;
    }

    /**
     * Tambah headers untuk request remote.
     */
    public function remoteHeaders(array $headers): static
    {
        $this->remoteHeaders = $headers;

        return $this;
    }

    /**
     * Pagination param names & default perPage (opsional).
     */
    public function remotePagination(?string $pageParam = 'page', ?string $perPageParam = 'per_page', ?int $perPage = null): static
    {
        $this->remotePageParam = $pageParam;
        $this->remotePerPageParam = $perPageParam;
        $this->remotePerPage = $perPage;

        return $this;
    }

    /**
     * Hint FE untuk caching hasil remote (opsional).
     */
    public function remoteCache(bool $enabled = true, ?int $ttlSeconds = 300): static
    {
        $this->remoteCache = $enabled;
        $this->remoteCacheTtlSeconds = $ttlSeconds;

        return $this;
    }

    // ── Metadata ke FE ────────────────────────────────────────────────────────

    protected function getMeta(): ?array
    {
        $meta = [
            'options' => $this->getOptions(),     // jika ada, FE boleh pakai tanpa remote
            'multiple' => $this->multiple,
            'searchable' => $this->searchable,
            'placeholder' => $this->placeholder,
        ];

        if ($this->remoteUrl) {
            $meta['remote'] = [
                'url' => $this->remoteUrl,
                'method' => $this->remoteMethod,
                'searchParam' => $this->remoteSearchParam,
                'minChars' => $this->remoteMinChars,
                'debounceMs' => $this->remoteDebounceMs,
                'params' => $this->remoteExtraParams,
                'headers' => $this->remoteHeaders,
                'valueKey' => $this->remoteValueKey,
                'labelKey' => $this->remoteLabelKey,
                'resultsPath' => $this->remoteResultsPath,
                'pageParam' => $this->remotePageParam,
                'perPageParam' => $this->remotePerPageParam,
                'perPage' => $this->remotePerPage,
                'cache' => [
                    'enabled' => $this->remoteCache,
                    'ttl' => $this->remoteCacheTtlSeconds,
                ],
            ];
        }

        return $meta;
    }

    // ── Filter logic backend ──────────────────────────────────────────────────

    protected function createFilter(): Filter
    {
        // AdvancedFilter akan:
        // - EQUALS/NOT_EQUALS → where = / !=
        // - IN/NOT_IN → whereIn/whereNotIn
        // - Dukung nested relasi & pivot lewat dot-notation properti
        return new AdvancedFilter($this->getName());
    }
}
