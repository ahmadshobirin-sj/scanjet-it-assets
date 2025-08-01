<?php

namespace App\Notifications;

use App\Enums\AppNotificationStatus;
use App\Enums\AppNotificationType;
use App\Helpers\ClosureHelper;
use Closure;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class AppNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Closure|bool $isBroadcast = true;

    protected Closure|bool $isDatabase = true;

    protected Closure|AppNotificationType $type = AppNotificationType::DEFAULT;

    protected Closure|AppNotificationStatus $status = AppNotificationStatus::INFO;

    protected Closure|string|null $url = null;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        private string $message,
        private ?string $description = null,
        private ?array $data = [],
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = [];
        if ($this->getIsBroadcast()) {
            $channels[] = 'broadcast';
        }
        if ($this->getIsDatabase()) {
            $channels[] = 'database';
        }

        return $channels;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => $this->getType()->value,
            'status' => $this->getStatus()->value,
            'message' => $this->message,
            'description' => $this->description,
            'url' => $this->getUrl(),
            'data' => $this->data,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'type' => $this->getType()->value,
            'status' => $this->getStatus()->value,
            'message' => $this->message,
            'description' => $this->description,
            'url' => $this->getUrl(),
            'created_at' => now()->toIso8601String(),
        ]);
    }

    public function getIsBroadcast(): bool
    {
        return ClosureHelper::evaluate($this->isBroadcast);
    }

    public function getIsDatabase(): bool
    {
        return ClosureHelper::evaluate($this->isDatabase);
    }

    public function getType()
    {
        return ClosureHelper::evaluate($this->type);
    }

    public function getStatus()
    {
        return ClosureHelper::evaluate($this->status);
    }

    public function getUrl(): ?string
    {
        return ClosureHelper::evaluate($this->url);
    }

    public function type(AppNotificationType|Closure $value): static
    {
        $this->type = $value;

        return $this;
    }

    public function status(AppNotificationStatus|Closure $value): static
    {
        $this->status = $value;

        return $this;
    }

    public function url(Closure|string|null $value): static
    {
        $this->url = $value;

        return $this;
    }

    public function viaBroadcast(Closure|bool $value = true): static
    {
        $this->isBroadcast = $value;

        return $this;
    }

    public function viaDatabase(Closure|bool $value = true): static
    {
        $this->isDatabase = $value;

        return $this;
    }
}
