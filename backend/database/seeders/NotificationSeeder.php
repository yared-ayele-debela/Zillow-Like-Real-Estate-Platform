<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::query()->whereIn('role', ['agent', 'buyer'])->get();
        $properties = Property::query()->pluck('id');

        if ($users->isEmpty()) {
            return;
        }

        $types = [
            'price_drop' => 'Price Drop Alert',
            'new_listing' => 'New Listing Match',
            'new_message' => 'New Message',
            'tour_request' => 'Tour Request',
            'property_approved' => 'Property Approved',
            'review_approved' => 'Review Approved',
        ];

        foreach ($users as $user) {
            foreach ($types as $type => $title) {
                $isRead = (bool) rand(0, 1);
                Notification::create([
                    'user_id' => $user->id,
                    'type' => $type,
                    'title' => $title,
                    'message' => $this->messageFor($type),
                    'data' => [
                        'source' => 'seeder',
                        'priority' => rand(0, 1) ? 'normal' : 'high',
                    ],
                    'property_id' => $properties->isNotEmpty() ? $properties->random() : null,
                    'is_read' => $isRead,
                    'read_at' => $isRead ? now()->subDays(rand(0, 10)) : null,
                    'created_at' => now()->subDays(rand(0, 30))->subHours(rand(0, 23)),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function messageFor(string $type): string
    {
        return match ($type) {
            'price_drop' => 'A saved property has a new lower price.',
            'new_listing' => 'A new listing matches your saved search.',
            'new_message' => 'You have received a new message.',
            'tour_request' => 'A user requested a tour for one of your listings.',
            'property_approved' => 'Your property listing was approved by admin.',
            'review_approved' => 'A review related to your account was approved.',
            default => 'You have a new notification.',
        };
    }
}
