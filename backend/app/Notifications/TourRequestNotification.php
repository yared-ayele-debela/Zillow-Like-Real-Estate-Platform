<?php

namespace App\Notifications;

use App\Models\Message;
use App\Models\Property;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TourRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Message $message;
    protected Property $property;

    /**
     * Create a new notification instance.
     */
    public function __construct(Message $message, Property $property)
    {
        $this->message = $message;
        $this->property = $property;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $sender = $this->message->sender;
        $tourData = $this->message->tour_request_data ?? [];

        $mail = (new MailMessage)
            ->subject('Tour Request: ' . $this->property->title)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line($sender->name . ' has requested a tour for your property.')
            ->line('**Property:** ' . $this->property->title)
            ->line($this->property->address . ', ' . $this->property->city . ', ' . $this->property->state)
            ->line('**Price:** $' . number_format($this->property->price, 0));

        if (!empty($tourData['preferred_dates'])) {
            $mail->line('**Preferred Dates:**')
                ->line(implode(', ', $tourData['preferred_dates']));
        }

        if (!empty($tourData['preferred_times'])) {
            $mail->line('**Preferred Times:**')
                ->line(implode(', ', $tourData['preferred_times']));
        }

        if (!empty($tourData['notes'])) {
            $mail->line('**Notes:**')
                ->line($tourData['notes']);
        }

        if (!empty($this->message->message)) {
            $mail->line('**Additional Message:**')
                ->line($this->message->message);
        }

        $mail->line('**Contact Information:**')
            ->line('Name: ' . $sender->name)
            ->line('Email: ' . $sender->email);
        
        if ($sender->phone) {
            $mail->line('Phone: ' . $sender->phone);
        }

        $mail->action('View Property', url('/properties/' . $this->property->id))
            ->action('Reply to Request', url('/agent/leads/' . $this->message->id))
            ->line('Thank you for using our application!');

        return $mail;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message_id' => $this->message->id,
            'property_id' => $this->property->id,
            'sender_id' => $this->message->sender_id,
            'sender_name' => $this->message->sender->name,
            'tour_request_data' => $this->message->tour_request_data,
        ];
    }
}
