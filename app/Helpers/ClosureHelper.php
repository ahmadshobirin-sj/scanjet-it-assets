<?php

namespace App\Helpers;

use Closure;

class ClosureHelper
{
    /**
     * Evaluate a value that might be a Closure
     */
    public static function evaluate($value, ...$args)
    {
        if ($value instanceof Closure) {
            return $value(...$args);
        }

        return $value;
    }
}
