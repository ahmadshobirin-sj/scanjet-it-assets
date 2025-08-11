<?php

namespace App\Enums;

enum AssetStatus: string
{
    case AVAILABLE = 'available';
    case ASSIGNED = 'assigned';
    case MAINTENANCE = 'maintenance';
    case LOST = 'lost';
    case STOLEN = 'stolen';
    case DAMAGED = 'damaged';
    case MALFUNCTIONING = 'malfunctioning';

    public function label(): string
    {
        return match ($this) {
            self::AVAILABLE => 'Available',
            self::ASSIGNED => 'Assigned',
            self::MAINTENANCE => 'Maintenance',
            self::LOST => 'Lost',
            self::STOLEN => 'Stolen',
            self::DAMAGED => 'Damaged',
            self::MALFUNCTIONING => 'Malfunctioning',
        };
    }

    public static function options(): array
    {
        return array_map(
            fn ($case) => ['value' => $case->value, 'label' => $case->label()],
            self::cases()
        );
    }
}
