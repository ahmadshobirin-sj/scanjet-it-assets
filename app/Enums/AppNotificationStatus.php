<?php

namespace App\Enums;

enum AppNotificationStatus: string
{
    case SUCCESS = 'success';
    case ERROR = 'error';
    case INFO = 'info';
    case WARNING = 'warning';

    public function label(): string
    {
        return match ($this) {
            self::SUCCESS => 'Success',
            self::ERROR => 'Error',
            self::INFO => 'Info',
            self::WARNING => 'Warning',
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
