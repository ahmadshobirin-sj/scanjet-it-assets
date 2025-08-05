<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'Admin';
    case INACTIVE = 'Inactive';
    case SUPER_ADMIN = 'Super Admin';

    public function label(): string
    {
        return match ($this) {
            self::ADMIN => 'Admin',
            self::INACTIVE => 'Inactive',
            self::SUPER_ADMIN => 'Super Admin',
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
