<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'msgraph' => [
        'client_id' => env('MSGRAPH_CLIENT_ID'),
        'client_secret' => env('MSGRAPH_CLIENT_SECRET'),
        'redirect_uri' => env('MSGRAPH_REDIRECT_URI'),
        'tenant_id' => env('MSGRAPH_TENANT_ID'),
        'authorize_endpoint' => 'https://login.microsoftonline.com/'.env('MSGRAPH_TENANT_ID', 'common').'/oauth2/v2.0/authorize',
        'token_endpoint' => 'https://login.microsoftonline.com/'.env('MSGRAPH_TENANT_ID', 'common').'/oauth2/v2.0/token',
        'landing_endpoint' => env('MSGRAPH_LANDING_ENDPOINT'),
        'scopes' => 'User.Read offline_access',
        'logout_endpoint' => 'https://login.microsoftonline.com/'.env('MSGRAPH_TENANT_ID', 'common').'/oauth2/v2.0/logout?post_logout_redirect_uri='.env('MSGRAPH_REDIRECT_URI', 'connect'),
    ],
];
