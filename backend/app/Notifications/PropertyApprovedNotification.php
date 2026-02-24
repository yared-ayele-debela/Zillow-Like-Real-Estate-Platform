<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PropertyApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected string $title,
        protected string $message,
        protected array $data = []
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->title)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line($this->message);
    }

    public function toArray(object $notifiable): array
    {
        return $this->data;
    }
}
