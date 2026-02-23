<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyImage extends Model
{
    protected $fillable = [
        'property_id',
        'image_path',
        'thumbnail_path',
        'order',
        'is_primary',
        'alt_text',
    ];

    protected $casts = [
        'order' => 'integer',
        'is_primary' => 'boolean',
    ];

    /**
     * Get the property that owns the image.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Get the full URL for the image.
     */
    public function getImageUrlAttribute(): string
    {
        return asset('storage/' . $this->image_path);
    }

    /**
     * Get the full URL for the thumbnail.
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        if (!$this->thumbnail_path) {
            return $this->image_url;
        }
        return asset('storage/' . $this->thumbnail_path);
    }
}
