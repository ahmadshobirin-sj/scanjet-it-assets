<?php

namespace App\Enums;

enum AssetAssignmentAssetCondition: string
{
    case OK = 'ok';
    case LOST = 'lost';
    case STOLEN = 'stolen';
    case DAMAGED = 'damaged';
    case MALFUNCTIONING = 'malfunctioning';

    public function label(): string
    {
        return match ($this) {
            self::OK => 'OK',
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

    public static function syncWithAssetStatus(AssetAssignmentAssetCondition $condition): AssetStatus
    {
        return match ($condition) {
            self::OK => AssetStatus::AVAILABLE,
            self::LOST => AssetStatus::LOST,
            self::STOLEN => AssetStatus::STOLEN,
            self::DAMAGED => AssetStatus::DAMAGED,
            self::MALFUNCTIONING => AssetStatus::MALFUNCTIONING,
            default => AssetStatus::AVAILABLE
        };
    }
}
