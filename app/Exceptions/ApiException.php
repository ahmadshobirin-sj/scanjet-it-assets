<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

final class ApiException
{
    /**
     * Batasi hanya request API (prefix /api).
     * Ubah logika ini kalau prefix-mu berbeda.
     */
    public static function shouldHandle(Request $request): bool
    {
        return $request->is('api/*');
    }

    /**
     * Render Throwable => JSON response yang konsisten.
     */
    public static function render(Throwable $e, Request $request): JsonResponse
    {
        $debug = (bool) config('app.debug');

        // Default
        $status = 500;
        $message = $debug ? ($e->getMessage() ?: 'Server Error.') : 'Server Error.';
        $payload = [
            'success' => false,
            'message' => $message,
            'type' => class_basename($e),
            'timestamp' => now()->toIso8601String(),
        ];

        // Khusus: Validasi
        if ($e instanceof ValidationException) {
            return response()->json([
                'success' => false,
                'message' => 'The given data was invalid.',
                'errors' => $e->errors(),
                'type' => class_basename($e),
                'timestamp' => now()->toIso8601String(),
            ], 422);
        }

        // Auth & Authorization
        if ($e instanceof AuthenticationException) {
            return response()->json($payload + ['message' => 'Unauthenticated.'], 401);
        }
        if ($e instanceof AuthorizationException) {
            return response()->json($payload + ['message' => 'This action is unauthorized.'], 403);
        }

        // 404 / 405 / 419 / 429
        if ($e instanceof NotFoundHttpException || $e instanceof ModelNotFoundException) {
            return response()->json($payload + ['message' => 'Not Found.'], 404);
        }
        if ($e instanceof MethodNotAllowedHttpException) {
            return response()->json($payload + ['message' => 'Method Not Allowed.'], 405);
        }
        if ($e instanceof TokenMismatchException) {
            return response()->json($payload + ['message' => 'CSRF token mismatch.'], 419);
        }
        if ($e instanceof ThrottleRequestsException) {
            return response()->json($payload + ['message' => 'Too Many Requests.'], 429);
        }

        // HttpException lain: pakai status bawaan
        if ($e instanceof HttpExceptionInterface) {
            $status = $e->getStatusCode();
            // Jika tidak debug & pesan kosong, pakai label generik
            $generic = [
                400 => 'Bad Request.',
                401 => 'Unauthenticated.',
                403 => 'Forbidden.',
                404 => 'Not Found.',
                405 => 'Method Not Allowed.',
                409 => 'Conflict.',
                422 => 'Unprocessable Entity.',
                429 => 'Too Many Requests.',
                500 => 'Server Error.',
                503 => 'Service Unavailable.',
            ];
            $msg = $debug ? ($e->getMessage() ?: ($generic[$status] ?? 'Error.'))
                : ($generic[$status] ?? 'Error.');

            return response()->json($payload + ['message' => $msg], $status);
        }

        // Fallback: 500
        if ($debug) {
            $payload['exception'] = get_class($e);
            $payload['file'] = $e->getFile();
            $payload['line'] = $e->getLine();
        }

        return response()->json($payload, 500);
    }
}
