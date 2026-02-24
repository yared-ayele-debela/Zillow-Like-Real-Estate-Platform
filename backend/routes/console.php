<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\CheckPriceDrops;
use App\Jobs\CheckSavedSearches;
use App\Jobs\SendDigest;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Notifications scheduling
Schedule::job(new CheckPriceDrops())->dailyAt('07:00');
Schedule::job(new CheckSavedSearches())->dailyAt('07:15');
Schedule::job(new SendDigest())->weeklyOn(1, '08:00');
