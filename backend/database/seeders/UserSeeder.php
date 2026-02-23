<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'email_verified_at' => now(),
            'is_active' => true,
            'is_verified' => true,
        ]);

        // Create Agent Users
        $agents = [
            [
                'name' => 'John Smith',
                'email' => 'agent1@test.com',
                'password' => Hash::make('password123'),
                'role' => 'agent',
                'phone' => '+1-555-0101',
                'bio' => 'Experienced real estate agent with over 10 years in the business. Specializing in luxury homes and commercial properties.',
                'company_name' => 'Premier Realty Group',
                'license_number' => 'RE-LIC-12345',
                'email_verified_at' => now(),
                'is_active' => true,
                'is_verified' => true,
            ],
            [
                'name' => 'Sarah Johnson',
                'email' => 'agent2@test.com',
                'password' => Hash::make('password123'),
                'role' => 'agent',
                'phone' => '+1-555-0102',
                'bio' => 'Dedicated real estate professional helping families find their dream homes. Expert in residential properties.',
                'company_name' => 'Dream Home Realty',
                'license_number' => 'RE-LIC-12346',
                'email_verified_at' => now(),
                'is_active' => true,
                'is_verified' => true,
            ],
            [
                'name' => 'Michael Brown',
                'email' => 'agent3@test.com',
                'password' => Hash::make('password123'),
                'role' => 'agent',
                'phone' => '+1-555-0103',
                'bio' => 'Commercial real estate specialist with expertise in office buildings and retail spaces.',
                'company_name' => 'Commercial Properties Inc',
                'license_number' => 'RE-LIC-12347',
                'email_verified_at' => now(),
                'is_active' => true,
                'is_verified' => true,
            ],
        ];

        foreach ($agents as $agent) {
            User::create($agent);
        }

        // Create Buyer Users
        $buyers = [
            [
                'name' => 'Emily Davis',
                'email' => 'buyer1@test.com',
                'password' => Hash::make('password123'),
                'role' => 'buyer',
                'phone' => '+1-555-0201',
                'email_verified_at' => now(),
                'is_active' => true,
            ],
            [
                'name' => 'David Wilson',
                'email' => 'buyer2@test.com',
                'password' => Hash::make('password123'),
                'role' => 'buyer',
                'phone' => '+1-555-0202',
                'email_verified_at' => now(),
                'is_active' => true,
            ],
            [
                'name' => 'Lisa Anderson',
                'email' => 'buyer3@test.com',
                'password' => Hash::make('password123'),
                'role' => 'buyer',
                'phone' => '+1-555-0203',
                'email_verified_at' => now(),
                'is_active' => true,
            ],
        ];

        foreach ($buyers as $buyer) {
            User::create($buyer);
        }

        // Create Guest User
        User::create([
            'name' => 'Guest User',
            'email' => 'guest@test.com',
            'password' => Hash::make('password123'),
            'role' => 'guest',
            'email_verified_at' => now(),
            'is_active' => true,
        ]);
    }
}
