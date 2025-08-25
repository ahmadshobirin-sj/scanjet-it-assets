<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate;

class MsGraphAuthenticated extends Authenticate
{
    protected function redirectTo($request): ?string
    {
        return route('authorize');
    }
}
