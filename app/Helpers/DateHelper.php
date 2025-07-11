<?php

namespace App\Helpers;

use Carbon\Carbon;

class DateHelper
{
    /**
     * Format a date to a specific format.
     *
     * @param string|\DateTimeInterface|null $date
     * @param string $format
     * @return string|null
     */
    public static function format($date, $format = 'd M Y')
    {
        if (!$date) {
            return null;
        }

        return Carbon::parse($date)->translatedFormat($format);
    }
}
