<?php

namespace App\Jobs;

use App\Services\SearchNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CheckPriceDrops implements ShouldQueue
{
    use Queueable;

    public function handle(SearchNotificationService $searchNotificationService): void
    {
        $searchNotificationService->notifyPriceDrops();
    }
}
