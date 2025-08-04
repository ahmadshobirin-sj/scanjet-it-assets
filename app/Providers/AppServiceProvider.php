<?php

namespace App\Providers;

use App\Listeners\NewMicrosoft365SignInListener;
use Dcblogdev\MsGraph\Events\NewMicrosoft365SignInEvent;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        if ($this->app->environment('local') && class_exists(\Laravel\Telescope\TelescopeServiceProvider::class)) {
            $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        DB::prohibitDestructiveCommands(app()->isProduction());

        RateLimiter::for('webhook', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        Event::listen(
            NewMicrosoft365SignInEvent::class,
            [NewMicrosoft365SignInListener::class, 'handle']
        );
    }
}
