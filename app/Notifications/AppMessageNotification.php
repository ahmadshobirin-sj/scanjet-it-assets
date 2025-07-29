<?php

namespace App\Notifications;

use App\Enums\AppMessageNotificationStatus;
use App\Enums\AppMessageNotificationType;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class AppMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        private string $message,
        private AppMessageNotificationType $type = AppMessageNotificationType::DEFAULT,
        private AppMessageNotificationStatus $status = AppMessageNotificationStatus::INFO,
        private bool $hasDetail = false,
        private ?string $title = null,
        private ?array $data = []
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => $this->type->value,
            'status' => $this->status->value,
            'message' => $this->message,
            'title' => $this->title,
            'hasDetail' => $this->hasDetail,
            'data' => $this->data,
        ];
    }
}
