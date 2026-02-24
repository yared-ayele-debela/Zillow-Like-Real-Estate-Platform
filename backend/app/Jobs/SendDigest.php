<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SendDigest implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        // Placeholder for weekly digest email generation.
        Log::info('Weekly digest job executed');
    }
}
