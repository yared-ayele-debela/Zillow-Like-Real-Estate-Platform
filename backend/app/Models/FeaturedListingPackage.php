<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeaturedListingPackage extends Model
{
    protected $fillable = [
        'name',
        'duration_days',
        'price',
        'currency',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'duration_days' => 'integer',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
