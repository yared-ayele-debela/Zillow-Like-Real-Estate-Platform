<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Amenity extends Model
{
    protected $fillable = [
        'name',
        'icon',
        'category',
    ];

    /**
     * Get the properties that have this amenity.
     */
    public function properties(): BelongsToMany
    {
        return $this->belongsToMany(Property::class, 'property_amenities')
            ->withTimestamps();
    }
}
