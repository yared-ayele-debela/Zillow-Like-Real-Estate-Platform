<?php

namespace Database\Seeders;

use App\Models\Message;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $agents = User::query()->where('role', 'agent')->get();
        $buyers = User::query()->where('role', 'buyer')->get();
        $properties = Property::query()->with('user:id')->get();

        if ($agents->isEmpty() || $buyers->isEmpty() || $properties->isEmpty()) {
            return;
        }

        $subjects = [
            'Property inquiry',
            'Is this still available?',
            'Requesting more details',
            'Tour availability',
            'Price negotiation',
        ];

        $messages = [
            'Hi, I am interested in this listing. Could you share more details?',
            'Can we schedule a visit this week?',
            'What are the monthly costs and fees for this property?',
            'I would like to know if the price is negotiable.',
            'Please let me know if this property is still available.',
        ];

        for ($i = 0; $i < 60; $i++) {
            $property = $properties->random();
            $buyer = $buyers->random();
            $agent = $agents->firstWhere('id', $property->user_id) ?? $agents->random();
            $type = ['inquiry', 'general', 'tour_request'][array_rand(['inquiry', 'general', 'tour_request'])];

            $isRead = (bool) rand(0, 1);
            $createdAt = now()->subDays(rand(0, 45))->subHours(rand(0, 23));

            Message::create([
                'sender_id' => $buyer->id,
                'receiver_id' => $agent->id,
                'property_id' => $property->id,
                'subject' => $subjects[array_rand($subjects)],
                'message' => $messages[array_rand($messages)],
                'is_read' => $isRead,
                'read_at' => $isRead ? (clone $createdAt)->addHours(rand(1, 24)) : null,
                'type' => $type,
                'tour_request_data' => $type === 'tour_request' ? [
                    'preferred_date' => now()->addDays(rand(1, 14))->toDateString(),
                    'preferred_time' => rand(0, 1) ? '10:00' : '15:30',
                    'notes' => 'Flexible schedule.',
                ] : null,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }
    }
}
