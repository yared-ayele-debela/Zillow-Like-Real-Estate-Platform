<?php

namespace App\Services;

use App\Models\Property;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NeighborhoodDataService
{
    public function getForProperty(Property $property): array
    {
        if (!$property->latitude || !$property->longitude) {
            return [
                'schools' => [],
                'walk_score' => null,
                'transit_score' => null,
            ];
        }

        $cacheKey = sprintf('neighborhood:property:%d', $property->id);

        return Cache::remember($cacheKey, now()->addHours(12), function () use ($property) {
            $apiKey = config('services.geoapify.key');

            if (!$apiKey) {
                return [
                    'schools' => [],
                    'walk_score' => null,
                    'transit_score' => null,
                ];
            }

            $lat = (float) $property->latitude;
            $lon = (float) $property->longitude;

            $schools = $this->fetchSchools($lat, $lon, $apiKey);

            return [
                'schools' => $schools,
                'walk_score' => null,
                'transit_score' => null,
            ];
        });
    }

    protected function fetchSchools(float $lat, float $lon, string $apiKey): array
    {
        try {
            $radiusMeters = 3000;

            $response = Http::timeout(5)->get('https://api.geoapify.com/v2/places', [
                'categories' => 'education.school,education.college',
                'filter' => sprintf('circle:%f,%f,%d', $lon, $lat, $radiusMeters),
                'bias' => sprintf('proximity:%f,%f', $lon, $lat),
                'limit' => 20,
                'apiKey' => $apiKey,
            ]);

            if (!$response->ok()) {
                return [];
            }

            $data = $response->json();
            $features = $data['features'] ?? [];

            return collect($features)
                ->map(function ($feature) use ($lat, $lon) {
                    $props = $feature['properties'] ?? [];

                    return [
                        'name' => $props['name'] ?? null,
                        'address' => $props['address_line2'] ?? $props['formatted'] ?? null,
                        'distance_m' => $props['distance'] ?? null,
                        'categories' => $props['categories'] ?? [],
                        'city' => $props['city'] ?? null,
                        'state' => $props['state'] ?? null,
                        'postcode' => $props['postcode'] ?? null,
                        'website' => $props['website'] ?? null,
                    ];
                })
                ->filter(fn ($school) => !empty($school['name']))
                ->values()
                ->all();
        } catch (\Throwable $e) {
            Log::warning('Failed to fetch schools from Geoapify', [
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }
}

