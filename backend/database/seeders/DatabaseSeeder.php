<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AmenitySeeder::class,
            UserSeeder::class,
            RolePermissionSeeder::class,
            SubscriptionPlanSeeder::class,
            FeaturedListingPackageSeeder::class,
            PropertySeeder::class,
            LocationSeeder::class,
            ReviewSeeder::class,
            FavoriteSeeder::class,
            SavedSearchSeeder::class,
            MessageSeeder::class,
            SubscriptionSeeder::class,
            PaymentSeeder::class,
            AppSettingSeeder::class,
            NotificationSeeder::class,
        ]);
    }
}
