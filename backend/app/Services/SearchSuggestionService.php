<?php

namespace App\Services;

use App\Models\Property;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SearchSuggestionService
{
    /**
     * Get search suggestions based on query.
     */
    public function getSuggestions(string $query, int $limit = 10): array
    {
        if (strlen($query) < 2) {
            return [];
        }

        $cacheKey = 'search_suggestions:' . md5($query);
        
        return Cache::remember($cacheKey, 3600, function () use ($query, $limit) {
            $suggestions = [];

            // City suggestions
            $cities = Property::where('city', 'like', "%{$query}%")
                ->select('city', DB::raw('count(*) as count'))
                ->groupBy('city')
                ->orderBy('count', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'type' => 'city',
                        'value' => $item->city,
                        'label' => $item->city,
                        'count' => $item->count,
                    ];
                });

            $suggestions = array_merge($suggestions, $cities->toArray());

            // State suggestions
            $states = Property::where('state', 'like', "%{$query}%")
                ->select('state', DB::raw('count(*) as count'))
                ->groupBy('state')
                ->orderBy('count', 'desc')
                ->limit(3)
                ->get()
                ->map(function ($item) {
                    return [
                        'type' => 'state',
                        'value' => $item->state,
                        'label' => $item->state,
                        'count' => $item->count,
                    ];
                });

            $suggestions = array_merge($suggestions, $states->toArray());

            // Property type suggestions
            $types = ['house', 'apartment', 'condo', 'land', 'commercial'];
            $matchingTypes = array_filter($types, function ($type) use ($query) {
                return stripos($type, $query) !== false;
            });

            foreach ($matchingTypes as $type) {
                $count = Property::where('property_type', $type)->count();
                $suggestions[] = [
                    'type' => 'property_type',
                    'value' => $type,
                    'label' => ucfirst($type),
                    'count' => $count,
                ];
            }

            return array_slice($suggestions, 0, $limit);
        });
    }

    /**
     * Get popular searches.
     */
    public function getPopularSearches(int $limit = 10): array
    {
        return Cache::remember('popular_searches', 3600, function () use ($limit) {
            // In a real app, you'd track searches in a table
            // For now, return common searches
            return [
                ['query' => 'house for sale', 'count' => 150],
                ['query' => 'apartment for rent', 'count' => 120],
                ['query' => 'Los Angeles', 'count' => 100],
                ['query' => 'New York', 'count' => 95],
                ['query' => '3 bedroom', 'count' => 85],
                ['query' => 'pool', 'count' => 70],
                ['query' => 'garage', 'count' => 65],
                ['query' => 'downtown', 'count' => 60],
            ];
        });
    }

    /**
     * Track a search query.
     */
    public function trackSearch(string $query): void
    {
        // In a real app, you'd store this in a searches table
        // For now, we'll just cache it
        $key = 'search_tracking:' . md5($query);
        $count = Cache::get($key, 0);
        Cache::put($key, $count + 1, 86400 * 30); // 30 days
    }
}
