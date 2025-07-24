<?php

namespace App\Helpers;

use Closure;

class ClosureHelper
{
    public static function evaluate(mixed $value, mixed $context = null): mixed
    {
        return $value instanceof Closure
            ? $value($context)
            : $value;
    }
}
