<?php

namespace App\Enums;

enum AppMessageNotificationStatus: string
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
}
