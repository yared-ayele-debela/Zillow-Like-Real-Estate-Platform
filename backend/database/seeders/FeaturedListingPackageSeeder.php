<?php

namespace Database\Seeders;

use App\Models\FeaturedListingPackage;
use Illuminate\Database\Seeder;

class FeaturedListingPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $packages = [
            [
                'name' => '1 Week Boost',
                'duration_days' => 7,
                'price' => 9.99,
                'currency' => 'USD',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => '1 Month Boost',
                'duration_days' => 30,
                'price' => 29.99,
                'currency' => 'USD',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => '3 Months Boost',
                'duration_days' => 90,
                'price' => 79.99,
                'currency' => 'USD',
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($packages as $package) {
            FeaturedListingPackage::updateOrCreate(
                ['name' => $package['name']],
                $package
            );
        }
    }
}
