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
        $prefix = 'sj-itam';
        $date = now()->format('ym');
        $time = now()->format('dHis');
        $random = Str::upper(Str::random(4));

        $final = Str::upper($prefix.'-'.$date.'-'.$time.$random);

        return $final;
    }
}
