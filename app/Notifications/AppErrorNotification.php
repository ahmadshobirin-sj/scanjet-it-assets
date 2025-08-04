<?php

namespace App\Notifications;

class AppErrorNotification extends AppNotification
{
    public function __construct(
        string $message,
        ?string $description = null,
        ?array $data = []
    ) {
        parent::__construct($message, $description, $data);
    }
}
