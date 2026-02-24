<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FavoriteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $buyers = User::query()->where('role', 'buyer')->get();
        $properties = Property::query()->pluck('id');

        if ($buyers->isEmpty() || $properties->isEmpty()) {
            return;
        }

        foreach ($buyers as $buyer) {
            $count = min(rand(5, 12), $properties->count());
            $propertyIds = $properties->random($count);

            foreach ($propertyIds as $propertyId) {
                DB::table('favorites')->updateOrInsert(
                    [
                        'user_id' => $buyer->id,
                        'property_id' => $propertyId,
                    ],
                    [
                        'created_at' => now()->subDays(rand(1, 60)),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }
}
