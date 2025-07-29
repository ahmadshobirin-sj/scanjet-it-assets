<?php

namespace App\Helpers;

use Carbon\Carbon;

class DateHelper
{
    /**
     * Format a date to a specific format.
     *
     * @param  string|\DateTimeInterface|null  $date
     * @param  string  $format
     * @param  bool  $withTime
     * @param  string  $timezone
     * @return string|null
     */
    public static function format($date, string $format = 'd M Y', bool $withTime = true, string $timezone = 'UTC'): ?string
    {
        if (! $date) {
            return null;
        }

        $carbon = Carbon::parse($date)->setTimezone($timezone);

        // Tambahkan jam jika diminta
        if ($withTime) {
            $format .= ' H:i';
        }

        return $carbon->translatedFormat($format);
    }
}
