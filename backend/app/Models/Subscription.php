<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'plan',
        'status',
        'starts_at',
        'ends_at',
        'auto_renew',
        'stripe_subscription_id',
        'stripe_customer_id',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'auto_renew' => 'boolean',
    ];

    /**
     * Get the user that owns the subscription.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if subscription is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && $this->ends_at->isFuture();
    }

    /**
     * Check if subscription is expired.
     */
    public function isExpired(): bool
    {
        return $this->ends_at->isPast();
    }

    /**
     * Check if subscription needs renewal.
     */
    public function needsRenewal(): bool
    {
        return $this->isActive() && $this->ends_at->diffInDays(now()) <= 7;
    }

    /**
     * Get plan price.
     */
    public function getPlanPrice(): float
    {
        return match ($this->plan) {
            'basic' => 29.99,
            'premium' => 79.99,
            'enterprise' => 199.99,
            default => 0,
        };
    }
}
