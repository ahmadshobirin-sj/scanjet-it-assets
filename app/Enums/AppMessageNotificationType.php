<?php

namespace App\Enums;

enum AppMessageNotificationType: string
{
    case DEFAULT = 'default';
    case EMAIL = 'email';

    public function label(): string
    {
        return match ($this) {
            self::DEFAULT => 'Default',
            self::EMAIL => 'Email',
        };
    }
}
