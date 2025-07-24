<?php

namespace App\Enums;

enum AssetStatus: string
{
    case AVAILABLE = 'available';
    case ASSIGNED = 'assigned';
    case MAINTENANCE = 'maintenance';
    case LOST = 'lost';
    case SCRAPPED = 'scrapped';
    case RETURNED = 'returned';

    public function label(): string
    {
        return match ($this) {
            self::AVAILABLE => 'Available',
            self::ASSIGNED => 'Assigned',
            self::MAINTENANCE => 'Maintenance',
            self::LOST => 'Lost',
            self::SCRAPPED => 'Scrapped',
            self::RETURNED => 'Returned',
        };
    }
}
