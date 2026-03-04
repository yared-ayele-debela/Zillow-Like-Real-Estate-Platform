<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Offer extends Model
{
    protected $fillable = [
        'property_id',
        'message_id',
        'amount',
        'status',
        'notes',
        'submitted_at',
        'responded_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'submitted_at' => 'datetime',
        'responded_at' => 'datetime',
    ];

    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_COUNTER = 'counter';

    public static function statuses(): array
    {
        return [
            self::STATUS_SUBMITTED => 'Submitted',
            self::STATUS_COUNTER => 'Counter',
            self::STATUS_ACCEPTED => 'Accepted',
            self::STATUS_REJECTED => 'Rejected',
        ];
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }
}
