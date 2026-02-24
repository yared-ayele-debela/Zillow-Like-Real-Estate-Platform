<?php

namespace Database\Seeders;

use App\Models\SavedSearch;
use App\Models\User;
use Illuminate\Database\Seeder;

class SavedSearchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::query()->whereIn('role', ['buyer', 'agent'])->get();

        if ($users->isEmpty()) {
            return;
        }

        $searchTemplates = [
            [
                'name' => 'Rome Apartments Under 400k',
                'filters' => [
                    'city' => 'Rome',
                    'state' => 'Lazio',
                    'property_type' => 'apartment',
                    'min_price' => 100000,
                    'max_price' => 400000,
                    'bedrooms' => 2,
                ],
            ],
            [
                'name' => 'Milan Rentals',
                'filters' => [
                    'city' => 'Milan',
                    'state' => 'Lombardy',
                    'status' => 'for_rent',
                    'min_price' => 700,
                    'max_price' => 2800,
                ],
            ],
            [
                'name' => 'Family Houses',
                'filters' => [
                    'property_type' => 'house',
                    'min_bedrooms' => 3,
                    'min_bathrooms' => 2,
                    'min_square_feet' => 1200,
                ],
            ],
        ];

        foreach ($users as $user) {
            foreach ($searchTemplates as $template) {
                SavedSearch::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'name' => $template['name'],
                    ],
                    [
                        'filters' => $template['filters'],
                        'email_notifications' => (bool) rand(0, 1),
                        'last_notified_at' => rand(0, 1) ? now()->subDays(rand(1, 14)) : null,
                    ]
                );
            }
        }
    }
}
