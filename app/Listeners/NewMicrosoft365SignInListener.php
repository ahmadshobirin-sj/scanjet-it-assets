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
        $user = User::updateOrCreate([
            'email' => $event->token['info']['mail'],
        ], [
            'name' => $event->token['info']['displayName'],
            'given_name' => $event->token['info']['givenName'] ?? null,
            'surname' => $event->token['info']['surname'] ?? null,
            'user_principal_name' => $event->token['info']['userPrincipalName'] ?? null,
            'business_phones' => $event->token['info']['businessPhones'] ?? [],
            'mobile_phone' => $event->token['info']['mobilePhone'] ?? null,
            'job_title' => $event->token['info']['jobTitle'] ?? null,
            'office_location' => $event->token['info']['officeLocation'] ?? null,
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
