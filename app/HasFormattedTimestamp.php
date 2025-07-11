<?php

namespace App;

use App\Helpers\DateHelper;

trait HasFormattedTimestamp
{
    public function getFCreatedAtAttribute()
    {
        return DateHelper::format($this->created_at, $this->getFormattedTimestampFormat());
    }

    public function getFUpdatedAtAttribute()
    {
        return DateHelper::format($this->updated_at, $this->getFormattedTimestampFormat());
    }


    protected function getFormattedTimestampFormat(): string
    {
        return property_exists($this, 'formatTimestamp') ? $this->formatTimestamp : 'd M Y, H:i';
    }
}
