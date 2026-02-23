<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedSearch extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'filters',
        'email_notifications',
        'last_notified_at',
    ];

    protected $casts = [
        'filters' => 'array',
        'email_notifications' => 'boolean',
        'last_notified_at' => 'datetime',
    ];

    /**
     * Get the user that owns the saved search.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
