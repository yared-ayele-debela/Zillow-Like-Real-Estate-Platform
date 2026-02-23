<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class GeocodingService
{
    protected string $apiKey;
    protected string $baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

    public function __construct()
    {
        $this->apiKey = "AIzaSyA1-06v_tH69x9kqjR_-1oYFp29E98ZtWg";
        // $this->apiKey = config('services.google_maps.api_key', env('GOOGLE_MAPS_API_KEY'));

    }

    /**
     * Geocode an address to get latitude and longitude.
     *
     * @param string $address
     * @return array|null ['latitude' => float, 'longitude' => float]
     */
    public function geocode(string $address): ?array
    {
        // Check cache first
        $cacheKey = 'geocode:' . md5($address);
        $cached = Cache::get($cacheKey);

        if ($cached) {
            return $cached;
        }

        try {
            $response = Http::get($this->baseUrl, [
                'address' => $address,
                'key' => $this->apiKey,
            ]);

            $data = $response->json();

            if ($data['status'] === 'OK' && !empty($data['results'])) {
                $location = $data['results'][0]['geometry']['location'];

                $result = [
                    'latitude' => (float) $location['lat'],
                    'longitude' => (float) $location['lng'],
                ];

                // Cache for 30 days
                Cache::put($cacheKey, $result, now()->addDays(30));

                return $result;
            }

            Log::warning('Geocoding failed', [
                'address' => $address,
                'status' => $data['status'] ?? 'UNKNOWN',
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Geocoding error', [
                'address' => $address,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Geocode a full address from components.
     *
     * @param string $address
     * @param string $city
     * @param string $state
     * @param string $zipCode
     * @param string $country
     * @return array|null
     */
    public function geocodeFullAddress(
        string $address,
        string $city,
        string $state,
        string $zipCode,
        string $country = 'USA'
    ): ?array {
        $fullAddress = sprintf(
            '%s, %s, %s %s, %s',
            $address,
            $city,
            $state,
            $zipCode,
            $country
        );

        return $this->geocode($fullAddress);
    }

    /**
     * Reverse geocode coordinates to get address.
     *
     * @param float $latitude
     * @param float $longitude
     * @return array|null
     */
    public function reverseGeocode(float $latitude, float $longitude): ?array
    {
        $cacheKey = 'reverse_geocode:' . md5("{$latitude},{$longitude}");
        $cached = Cache::get($cacheKey);

        if ($cached) {
            return $cached;
        }

        try {
            $response = Http::get($this->baseUrl, [
                'latlng' => "{$latitude},{$longitude}",
                'key' => $this->apiKey,
            ]);

            $data = $response->json();

            if ($data['status'] === 'OK' && !empty($data['results'])) {
                $result = $data['results'][0];

                // Cache for 30 days
                Cache::put($cacheKey, $result, now()->addDays(30));

                return $result;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Reverse geocoding error', [
                'latitude' => $latitude,
                'longitude' => $longitude,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
