<?php

namespace App\Providers;

use App\Listeners\NewMicrosoft365SignInListener;
use Dcblogdev\MsGraph\Events\NewMicrosoft365SignInEvent;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

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

        /**
         * Tambah pesan success ke flash sekali pakai.
         * - Auto-buat UUID kalau belum ada.
         * - Menggabungkan dengan flash sebelumnya bila dipanggil berkali-kali.
         */
        RedirectResponse::macro('withSuccessFlash', function (string|array $message, ?string $id = null) {
            /** @var RedirectResponse $this */
            $flash = session()->get('flash', []);

            $id = $id ?? ($flash['id'] ?? (string) Str::uuid());

            // Jika belum ada 'success' sebelumnya dan input berupa string -> tetap string.
            if (! array_key_exists('success', $flash) && is_string($message)) {
                $success = $message;
            } else {
                // Normalisasi keduanya ke array, lalu merge + unique
                $curr = $flash['success'] ?? [];
                $currArr = is_array($curr) ? $curr : [$curr];
                $msgArr = is_array($message) ? array_values($message) : [$message];

                // Bersihkan nilai kosong dan duplikat
                $merged = array_values(array_unique(array_filter(
                    array_map('strval', array_merge($currArr, $msgArr)),
                    static fn ($v) => $v !== ''
                )));

                // Jika jumlah item = 1, simpan sebagai string; else array
                $success = count($merged) === 1 ? $merged[0] : $merged;
            }

            $mergedFlash = [
                'id' => $id,
                'success' => $success,
                'errors' => $flash['errors'] ?? [],
            ];

            session()->flash('flash', $mergedFlash);

            return $this;
        });

        /**
         * Tambah pesan error ke flash sekali pakai.
         * Cocok untuk toast error umum (bukan detail validasi per-field).
         */
        RedirectResponse::macro('withErrorsFlash', function (string|array $errors, ?string $id = null) {
            /** @var RedirectResponse $this */
            $flash = session()->get('flash', []);

            $id = $id ?? ($flash['id'] ?? (string) Str::uuid());

            if (! array_key_exists('errors', $flash) && is_string($errors)) {
                $errs = $errors;
            } else {
                $curr = $flash['errors'] ?? [];
                $currArr = is_array($curr) ? $curr : [$curr];
                $errArr = is_array($errors) ? array_values($errors) : [$errors];

                $merged = array_values(array_unique(array_filter(
                    array_map('strval', array_merge($currArr, $errArr)),
                    static fn ($v) => $v !== ''
                )));

                $errs = count($merged) === 1 ? $merged[0] : $merged;
            }

            $mergedFlash = [
                'id' => $id,
                'success' => $flash['success'] ?? [],
                'errors' => $errs,
            ];

            session()->flash('flash', $mergedFlash);

            return $this;
        });

        RateLimiter::for('webhook', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        Event::listen(
            NewMicrosoft365SignInEvent::class,
            [NewMicrosoft365SignInListener::class, 'handle']
        );
    }
}
