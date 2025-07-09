<?php

namespace App\Providers;

use App\Listeners\NewMicrosoft365SignInListener;
use Dcblogdev\MsGraph\Events\NewMicrosoft365SignInEvent;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(
            NewMicrosoft365SignInEvent::class,
            [NewMicrosoft365SignInListener::class, 'handle']
        );
    }
}
