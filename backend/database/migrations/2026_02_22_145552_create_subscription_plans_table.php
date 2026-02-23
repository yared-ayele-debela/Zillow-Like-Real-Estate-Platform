<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('price', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->json('features')->nullable();
            $table->string('stripe_price_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        DB::table('subscription_plans')->insert([
            [
                'name' => 'Basic',
                'slug' => 'basic',
                'price' => 29.99,
                'currency' => 'USD',
                'features' => json_encode([
                    'Up to 10 property listings',
                    'Basic analytics',
                    'Email support',
                    'Standard listing visibility',
                ]),
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Premium',
                'slug' => 'premium',
                'price' => 79.99,
                'currency' => 'USD',
                'features' => json_encode([
                    'Unlimited property listings',
                    'Advanced analytics',
                    'Priority support',
                    'Featured listing priority',
                ]),
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'price' => 199.99,
                'currency' => 'USD',
                'features' => json_encode([
                    'Everything in Premium',
                    'API access',
                    'Dedicated account manager',
                    '24/7 phone support',
                ]),
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
