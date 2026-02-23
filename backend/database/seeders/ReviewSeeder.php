<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $properties = Property::all();
        $agents = User::where('role', 'agent')->get();
        $buyers = User::where('role', 'buyer')->get();

        if ($properties->isEmpty()) {
            $this->command->warn('No properties found. Please run PropertySeeder first.');
            return;
        }

        if ($buyers->isEmpty()) {
            $this->command->warn('No buyers found. Please run UserSeeder first.');
            return;
        }

        // Sample review texts
        $reviewTexts = [
            'Excellent property! Very well maintained and in a great location.',
            'Beautiful home with amazing features. Highly recommend!',
            'Great value for money. The property exceeded our expectations.',
            'Nice property but could use some updates. Overall satisfied.',
            'Outstanding service from the agent. Very professional and helpful.',
            'The property is exactly as described. Very happy with the purchase.',
            'Good location and decent condition. Some minor issues but nothing major.',
            'Fantastic experience! The agent was knowledgeable and responsive.',
            'Loved the property! Great neighborhood and excellent amenities nearby.',
            'The property needs some work but has great potential.',
            'Professional agent who made the process smooth and easy.',
            'Beautiful property with lots of character. Highly satisfied!',
            'Good property at a fair price. Would recommend to others.',
            'The agent was very helpful throughout the entire process.',
            'Nice property but the price was a bit high for the area.',
            'Excellent communication and service. Very pleased!',
            'Great property with modern features. Very happy with our decision.',
            'The agent was patient and answered all our questions.',
            'Good property overall. Some renovations needed but worth it.',
            'Outstanding property! Everything we were looking for and more.',
        ];

        // Create reviews for properties
        foreach ($properties->take(15) as $property) {
            // Create 2-4 reviews per property
            $reviewCount = rand(2, 4);

            for ($i = 0; $i < $reviewCount; $i++) {
                $buyer = $buyers->random();

                // Check if this buyer already reviewed this property
                $existingReview = Review::where('user_id', $buyer->id)
                    ->where('property_id', $property->id)
                    ->first();

                if (!$existingReview) {
                    $rating = rand(3, 5); // Mostly positive reviews (3-5 stars)
                    $hasText = rand(0, 1); // 50% chance of having review text

                    Review::create([
                        'user_id' => $buyer->id,
                        'property_id' => $property->id,
                        'agent_id' => null,
                        'rating' => $rating,
                        'review' => $hasText ? $reviewTexts[array_rand($reviewTexts)] : null,
                        'is_approved' => rand(0, 1) === 1, // 50% approved, 50% pending
                        'created_at' => now()->subDays(rand(1, 90)), // Random date in last 90 days
                    ]);
                }
            }
        }

        // Create reviews for agents
        foreach ($agents->take(10) as $agent) {
            // Create 1-3 reviews per agent
            $reviewCount = rand(1, 3);

            for ($i = 0; $i < $reviewCount; $i++) {
                $buyer = $buyers->random();

                // Check if this buyer already reviewed this agent
                $existingReview = Review::where('user_id', $buyer->id)
                    ->where('agent_id', $agent->id)
                    ->first();

                if (!$existingReview) {
                    $rating = rand(4, 5); // Agent reviews are mostly 4-5 stars
                    $hasText = rand(0, 1);

                    Review::create([
                        'user_id' => $buyer->id,
                        'property_id' => null,
                        'agent_id' => $agent->id,
                        'rating' => $rating,
                        'review' => $hasText ? $reviewTexts[array_rand($reviewTexts)] : null,
                        'is_approved' => rand(0, 1) === 1,
                        'created_at' => now()->subDays(rand(1, 90)),
                    ]);
                }
            }
        }

        $this->command->info('Reviews seeded successfully!');
    }
}
