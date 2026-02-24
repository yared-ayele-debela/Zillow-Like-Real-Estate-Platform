<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use Illuminate\Database\Seeder;

class AppSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AppSetting::updateOrCreate(
            ['key' => 'site'],
            [
                'value' => [
                    'site_name' => 'Zillow Clone Italia',
                    'site_description' => 'Find and manage real estate listings across Italy.',
                    'maintenance_mode' => false,
                    'allow_registration' => true,
                    'require_email_verification' => true,
                ],
            ]
        );

        AppSetting::updateOrCreate(
            ['key' => 'email'],
            [
                'value' => [
                    'mail_driver' => 'smtp',
                    'mail_host' => 'smtp.mailtrap.io',
                    'mail_port' => '2525',
                    'mail_username' => 'demo_user',
                    'mail_password' => 'demo_password',
                    'mail_from_address' => 'noreply@zillowclone.test',
                    'mail_from_name' => 'Zillow Clone Italia',
                ],
            ]
        );
    }
}
