<?php

namespace App\Helpers;

use Illuminate\Support\Str;

class GenerateRefCode
{
    /**
     * Generate a unique reference code.
     */
    public static function generate(): string
    {
        $prefix = 'sj-ref';
        $randomString = Str::random(5);
        $code = Str::substr(md5(now()), rand(0, 3), 5);
        $uuid = Str::uuid7();
        $codeUuid = Str::substr($uuid, Str::length($uuid) - 5, 5);

        $final = Str::upper($prefix.'-'.$randomString.$code.$codeUuid);

        return $final;
    }
}
