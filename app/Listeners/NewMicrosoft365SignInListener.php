<?php

namespace App\Listeners;

use App\Models\User;
use Dcblogdev\MsGraph\MsGraph;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class NewMicrosoft365SignInListener
{
    public function handle(object $event): void
    {
        $user = User::firstOrCreate([
            'email' => $event->token['info']['mail'],
        ], [
            'id' => (string) Str::uuid(),
            'name' => $event->token['info']['displayName'],
            'email' => $event->token['info']['mail'] ?? $event->token['info']['userPrincipalName'],
        ]);

        (new MsGraph)->storeToken(
            $event->token['accessToken'],
            $event->token['refreshToken'],
            $event->token['expires'],
            $user->id,
            $user->email
        );

        Auth::login($user);
    }
}
