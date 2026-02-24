<?php

namespace App\Services;

use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Create notification and optionally deliver email.
     */
    public function send(
        User $user,
        string $type,
        string $title,
        string $message,
        ?array $data = null,
        ?int $propertyId = null,
        bool $sendEmail = false
    ): Notification {
        $notification = $this->sendInApp($user, $type, $title, $message, $data, $propertyId);

        if ($sendEmail) {
            $this->sendEmail($user, $title, $message, $data);
        }

        return $notification;
    }

    /**
     * Log email notification dispatch (extend with Mailables as needed).
     */
    public function sendEmail(User $user, string $title, string $message, ?array $data = null): void
    {
        Log::info('Email notification dispatch', [
            'user_id' => $user->id,
            'email' => $user->email,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Store in-app notification.
     */
    public function sendInApp(
        User $user,
        string $type,
        string $title,
        string $message,
        ?array $data = null,
        ?int $propertyId = null
    ): Notification {
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'property_id' => $propertyId,
            'is_read' => false,
            'read_at' => null,
        ]);

        event(new NotificationCreated($notification));

        return $notification;
    }

    /**
     * Mark one notification as read.
     */
    public function markAsRead(Notification $notification): Notification
    {
        if (!$notification->is_read) {
            $notification->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return $notification->fresh();
    }
}
