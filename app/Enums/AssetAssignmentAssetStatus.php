<?php

namespace App\Enums;

enum AssetAssignmentAssetStatus: string
{
    case ASSIGNED = 'assigned';
    case RETURNED = 'returned';

    public function label(): string
    {
        return match ($this) {
            self::ASSIGNED => 'Assigned',
            self::RETURNED => 'Returned',
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
