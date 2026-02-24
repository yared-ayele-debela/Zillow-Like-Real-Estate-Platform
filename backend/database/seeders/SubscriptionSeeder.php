<?php

namespace Database\Seeders;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;

class SubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $agents = User::query()->where('role', 'agent')->get();
        $plans = ['basic', 'premium', 'enterprise'];

        if ($agents->isEmpty()) {
            return;
        }

        foreach ($agents as $agent) {
            $plan = $plans[array_rand($plans)];
            $status = ['active', 'cancelled', 'expired'][array_rand(['active', 'cancelled', 'expired'])];
            $startsAt = now()->subDays(rand(10, 180));
            $endsAt = (clone $startsAt)->addDays(30);

            if ($status === 'expired') {
                $endsAt = now()->subDays(rand(1, 20));
            } elseif ($status === 'active') {
                $endsAt = now()->addDays(rand(5, 40));
            }

            Subscription::updateOrCreate(
                ['user_id' => $agent->id],
                [
                    'plan' => $plan,
                    'status' => $status,
                    'starts_at' => $startsAt,
                    'ends_at' => $endsAt,
                    'auto_renew' => $status === 'active',
                    'stripe_subscription_id' => 'sub_demo_' . $agent->id,
                    'stripe_customer_id' => 'cus_demo_' . $agent->id,
                ]
            );
        }
    }
}
