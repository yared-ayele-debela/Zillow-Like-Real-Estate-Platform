<?php

namespace App\Services;

use App\Models\Property;
use Illuminate\Database\Eloquent\Collection;

class NearbyPropertiesService
{
    /**
     * Find nearby properties within a radius.
     */
    public function findNearby(
        float $latitude,
        float $longitude,
        float $radiusMiles = 10,
        ?int $excludePropertyId = null,
        ?string $propertyType = null,
        int $limit = 6
    ): Collection {
        $earthRadius = 3959; // Earth radius in miles

        $query = Property::selectRaw(
            "*, (
                {$earthRadius} * acos(
                    cos(radians(?)) * cos(radians(latitude)) *
                    cos(radians(longitude) - radians(?)) +
                    sin(radians(?)) * sin(radians(latitude))
                )
            ) AS distance",
            [$latitude, $longitude, $latitude]
        )
        ->with(['user', 'images', 'amenities'])
        ->where('is_approved', true)
        ->whereNotNull('latitude')
        ->whereNotNull('longitude')
        ->having('distance', '<=', $radiusMiles)
        ->orderBy('distance');

        // Exclude current property
        if ($excludePropertyId) {
            $query->where('id', '!=', $excludePropertyId);
        }

        // Filter by property type if specified
        if ($propertyType) {
            $query->where('property_type', $propertyType);
        }

        return $query->limit($limit)->get();
    }

    /**
     * Find similar properties (same type, similar price range).
     */
    public function findSimilar(
        Property $property,
        float $priceVariance = 0.2, // 20% variance
        int $limit = 6
    ): Collection {
        $minPrice = $property->price * (1 - $priceVariance);
        $maxPrice = $property->price * (1 + $priceVariance);

        return Property::with(['user', 'images', 'amenities'])
            ->where('is_approved', true)
            ->where('id', '!=', $property->id)
            ->where('property_type', $property->property_type)
            ->where('status', $property->status)
            ->whereBetween('price', [$minPrice, $maxPrice])
            ->orderByRaw('ABS(price - ?)', [$property->price])
            ->limit($limit)
            ->get();
    }
}
