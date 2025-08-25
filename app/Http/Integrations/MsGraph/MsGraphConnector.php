<?php

namespace App\Http\Integrations\MsGraph;

use Saloon\Helpers\OAuth2\OAuthConfig;
use Saloon\Http\Connector;
use Saloon\RateLimitPlugin\Contracts\RateLimitStore;
use Saloon\RateLimitPlugin\Limit;
use Saloon\RateLimitPlugin\Stores\MemoryStore;
use Saloon\RateLimitPlugin\Traits\HasRateLimits;
use Saloon\Traits\OAuth2\AuthorizationCodeGrant;
use Saloon\Traits\Plugins\AcceptsJson;
use Saloon\Traits\Plugins\HasTimeout;

class MsGraphConnector extends Connector
{
    use AcceptsJson;
    use AuthorizationCodeGrant;
    use HasRateLimits;
    use HasTimeout;

    protected int $connectTimeout = 60;

    protected int $requestTimeout = 120;

    /**
     * Properti user yang ingin diambil
     *
     * @var list<string>
     */
    private const USER_SELECT_FIELDS = [
        'id',
        'userPrincipalName',
        'mail',
        'preferredLanguage',
        'businessPhones',
        'givenName',
        'jobTitle',
        'mobilePhone',
        'officeLocation',
        'department',
        'surname',
        'displayName',
    ];

    /**
     * Properti manager yang ingin diambil saat $expand=manager(...)
     *
     * @var list<string>
     */
    private const MANAGER_SELECT_FIELDS = [
        'mail',
    ];

    public function __construct(private string $version = 'v1.0') {}

    protected function resolveLimits(): array
    {
        return [
            Limit::allow(10000)->everySeconds(600)->sleep(),
        ];
    }

    protected function resolveRateLimitStore(): RateLimitStore
    {
        return new MemoryStore;
    }

    /**
     * The Base URL of the API.
     */
    public function resolveBaseUrl(): string
    {
        return "https://graph.microsoft.com/{$this->version}";
    }

    /**
     * Membangun endpoint profil user (default `/me`) beserta query $select & $expand manager.
     *
     * @param  string  $path  Endpoint path (default "/me")
     * @param  list<string>|null  $userSelect  Override field-field user untuk $select
     * @param  list<string>|null  $managerSelect  Override field-field manager untuk $expand
     */
    public function buildUserEndpoint(
        string $path = '/me',
        ?array $userSelect = null,
        ?array $managerSelect = null
    ): string {
        $userSelect = $userSelect ?? self::USER_SELECT_FIELDS;
        $managerSelect = $managerSelect ?? self::MANAGER_SELECT_FIELDS;

        $expandManager = sprintf('manager($select=%s)', implode(',', $managerSelect));

        $query = http_build_query([
            '$select' => implode(',', $userSelect),
            '$expand' => $expandManager,
        ]);

        return "{$path}?{$query}";
    }

    /**
     * Konfigurasi OAuth2 untuk Saloon AuthorizationCodeGrant.
     * Mengambil client/secret/redirect/scopes dari config('services.msgraph').
     */
    protected function defaultOauthConfig(): OAuthConfig
    {
        $cfg = config('services.msgraph');
        $scopes = explode(' ', $cfg['scopes']);

        return OAuthConfig::make()
            ->setClientId((string) $cfg['client_id'])
            ->setClientSecret((string) $cfg['client_secret'])
            ->setRedirectUri((string) $cfg['redirect_uri'])
            ->setDefaultScopes($scopes)
            ->setAuthorizeEndpoint((string) $cfg['authorize_endpoint'])
            ->setTokenEndpoint((string) $cfg['token_endpoint'])
            ->setUserEndpoint($this->buildUserEndpoint()); // /me + $select + $expand manager
    }
}
