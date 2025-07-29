<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AssetAssignmentConfirmation extends Notification implements ShouldQueue
{
    use Queueable;

    private array $assetAssignment;

    /**
     * Create a new notification instance.
     */
    public function __construct(array $assetAssignment)
    {
        $this->assetAssignment = $assetAssignment;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        if ($notifiable instanceof AnonymousNotifiable) {
            return ['mail'];
        }

        // Jika Eloquent model (misalnya User), gunakan database
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Asset assignment confirmation')
            ->view('emails.asset-assignment-confirmation', [
                'data' => $this->assetAssignment,
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->assetAssignment;
    }
}
