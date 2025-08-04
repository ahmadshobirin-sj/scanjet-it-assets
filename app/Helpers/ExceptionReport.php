<?php

namespace App\Helpers;

use App\Enums\AppNotificationStatus;
use App\Exceptions\ClientException;
use App\Notifications\AppErrorNotification;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Notification;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class ExceptionReport
{
    public static function report(Throwable $exception)
    {
        if (self::isServerError($exception)) {
            self::handleServerError($exception);
        }
    }

    public static function isClientError(Throwable $e): bool
    {
        return $e instanceof HttpExceptionInterface &&
            in_array($e->getStatusCode(), [401, 403, 404, 419, 503]);
    }

    public static function isServerError(Throwable $e): bool
    {
        return ! self::isClientError($e)
            && (
                $e instanceof QueryException ||
                $e instanceof \Error ||
                $e instanceof \ErrorException ||
                $e instanceof \Exception
            );
    }

    public static function handleServerError(Throwable $e)
    {
        /** @var \Illuminate\Contracts\Auth\Guard $guard */
        $guard = auth();

        $isClientException = $e instanceof ClientException;

        $message = $e->getMessage();

        if (app()->isProduction() && ! $isClientException) {
            $message = 'An unexpected error occurred. Please try refreshing the page. If the problem persists, contact the IT team.';
        }

        $description = null;
        if ($isClientException && method_exists($e, 'getDescription')) {
            /** @var ClientException $e */
            $description = $e->getDescription();
        }

        if ($guard->check()) {
            Notification::send(
                $guard->user(),
                (
                    new AppErrorNotification(
                        message: $message,
                        description: $description,
                    )
                )
                    ->viaDatabase(false)
                    ->status(AppNotificationStatus::ERROR)
            );
        }
    }
}
