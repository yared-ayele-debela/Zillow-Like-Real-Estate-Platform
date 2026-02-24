<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Basic',
                'slug' => 'basic',
                'price' => 29.99,
                'currency' => 'USD',
                'features' => [
                    'Up to 10 active listings',
                    'Basic analytics',
                    'Email support',
                ],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Premium',
                'slug' => 'premium',
                'price' => 79.99,
                'currency' => 'USD',
                'features' => [
                    'Unlimited listings',
                    'Advanced analytics',
                    'Priority support',
                    'Featured listing discount',
                ],
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'price' => 199.99,
                'currency' => 'USD',
                'features' => [
                    'Everything in Premium',
                    'API access',
                    'Dedicated account manager',
                ],
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
