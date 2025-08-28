<?php

use App\Exceptions\ApiException;
use App\Helpers\ExceptionReport;
use App\Http\Middleware\EnsureHasAuthorizationCode;
use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\MsGraphAuthenticated;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->group('api', [
            ForceJsonResponse::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'MsGraphAuthenticated' => MsGraphAuthenticated::class,
            'EnsureHasAuthorizationCode' => EnsureHasAuthorizationCode::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            if (ApiException::shouldHandle($request)) {
                return ApiException::render($e, $request);
            }

            return null;
        });

        if (app()->isProduction()) {
            $exceptions->reportable(function (Throwable $e) {
                ExceptionReport::report($e);
            });

            // Override the default exception handler to return a 200 response
            $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
                if (ExceptionReport::isServerError($exception)) {
                    return response(null, 200);
                } else {
                    return Inertia::render('error', [
                        'status' => $response->getStatusCode(),
                    ])
                        ->toResponse($request)
                        ->setStatusCode($response->getStatusCode());
                }

                return $response;
            });
        }
    })->create();
