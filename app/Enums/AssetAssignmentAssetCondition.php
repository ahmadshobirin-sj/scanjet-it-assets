<?php

namespace App\Enums;

enum AssetAssignmentAssetCondition: string
{
    case OK = 'ok';
    case LOST = 'lost';
    case STOLEN = 'stolen';
    case DEMAGED = 'damaged';
    case MALFUNCTIONING = 'malfunctioning';

    public function label(): string
    {
        return match ($this) {
            self::OK => 'OK',
            self::LOST => 'Lost',
            self::STOLEN => 'Stolen',
            self::DEMAGED => 'Damaged',
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
