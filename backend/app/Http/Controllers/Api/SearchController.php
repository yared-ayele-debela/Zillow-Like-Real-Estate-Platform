<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Property;
use App\Models\Amenity;
use App\Services\PropertySearchService;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    protected PropertySearchService $searchService;

    public function __construct(PropertySearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    /**
     * Search properties with filters.
     */
    public function search(Request $request)
    {
        $filters = $request->only([
            'search',
            'property_type',
            'status',
            'min_price',
            'max_price',
            'bedrooms',
            'bathrooms',
            'min_square_feet',
            'max_square_feet',
            'min_year_built',
            'max_year_built',
            'city',
            'state',
            'zip_code',
            'amenities',
            'featured',
            'sort_by',
            'sort_order',
            'latitude',
            'longitude',
            'radius',
        ]);

        // Handle amenities array
        if ($request->has('amenities')) {
            $filters['amenities'] = is_array($request->amenities)
                ? $request->amenities
                : explode(',', $request->amenities);
        }

        // Handle bounds
        if ($request->has('bounds')) {
            $filters['bounds'] = is_array($request->bounds)
                ? $request->bounds
                : json_decode($request->bounds, true);
        }

        $perPage = min($request->get('per_page', 15), 100);

        $results = $this->searchService->search($filters, $perPage);

        return response()->json($results);
    }

    /**
     * Search properties by map bounds.
     */
    public function searchByBounds(Request $request)
    {
        $request->validate([
            'north' => ['required', 'numeric'],
            'south' => ['required', 'numeric'],
            'east' => ['required', 'numeric'],
            'west' => ['required', 'numeric'],
        ]);

        $filters = [
            'bounds' => [
                'north' => $request->north,
                'south' => $request->south,
                'east' => $request->east,
                'west' => $request->west,
            ],
        ];

        // Add other filters if provided
        if ($request->has('property_type')) {
            $filters['property_type'] = $request->property_type;
        }
        if ($request->has('status')) {
            $filters['status'] = $request->status;
        }
        if ($request->has('min_price')) {
            $filters['min_price'] = $request->min_price;
        }
        if ($request->has('max_price')) {
            $filters['max_price'] = $request->max_price;
        }

        $query = $this->searchService->buildSearchQuery($filters);
        $properties = $query->get(['id', 'title', 'price', 'latitude', 'longitude', 'address', 'city', 'property_type', 'status']);

        return response()->json([
            'properties' => $properties,
            'count' => $properties->count(),
        ]);
    }

    /**
     * Get search suggestions.
     */
    public function suggestions(Request $request)
    {
        $query = $request->get('q', '');

        if (strlen($query) < 2) {
            return response()->json(['suggestions' => []]);
        }

        $suggestions = [];

        // City suggestions from managed locations first.
        $cities = Location::where('is_active', true)
            ->where('city', 'like', "%{$query}%")
            ->orderBy('city')
            ->pluck('city')
            ->take(5)
            ->map(function ($city) {
                return ['type' => 'city', 'value' => $city, 'label' => $city];
            });

        if ($cities->isEmpty()) {
            $cities = Property::where('city', 'like', "%{$query}%")
                ->distinct()
                ->pluck('city')
                ->take(5)
                ->map(function ($city) {
                    return ['type' => 'city', 'value' => $city, 'label' => $city];
                });
        }

        $suggestions = array_merge($suggestions, $cities->toArray());

        // State suggestions from managed locations first.
        $states = Location::where('is_active', true)
            ->where('state', 'like', "%{$query}%")
            ->orderBy('state')
            ->pluck('state')
            ->unique()
            ->take(3)
            ->map(function ($state) {
                return ['type' => 'state', 'value' => $state, 'label' => $state];
            });

        if ($states->isEmpty()) {
            $states = Property::where('state', 'like', "%{$query}%")
                ->distinct()
                ->pluck('state')
                ->take(3)
                ->map(function ($state) {
                    return ['type' => 'state', 'value' => $state, 'label' => $state];
                });
        }

        $suggestions = array_merge($suggestions, $states->toArray());

        // Property type suggestions
        $types = ['house', 'apartment', 'condo', 'land', 'commercial'];
        $matchingTypes = array_filter($types, function ($type) use ($query) {
            return stripos($type, $query) !== false;
        });

        foreach ($matchingTypes as $type) {
            $suggestions[] = [
                'type' => 'property_type',
                'value' => $type,
                'label' => ucfirst($type),
            ];
        }

        return response()->json(['suggestions' => array_slice($suggestions, 0, 10)]);
    }

    /**
     * Get available filter options.
     */
    public function filterOptions()
    {
        $managedStates = Location::where('is_active', true)
            ->orderBy('state')
            ->pluck('state')
            ->unique()
            ->values();
        $managedCities = Location::where('is_active', true)
            ->orderBy('city')
            ->pluck('city')
            ->unique()
            ->values();

        $options = [
            'property_types' => ['house', 'apartment', 'condo', 'land', 'commercial'],
            'statuses' => ['for_sale', 'for_rent', 'sold', 'pending'],
            'states' => $managedStates->isNotEmpty()
                ? $managedStates
                : Property::distinct()->pluck('state')->sort()->values(),
            'cities' => $managedCities->isNotEmpty()
                ? $managedCities->take(50)
                : Property::distinct()->pluck('city')->sort()->values()->take(50),
            'amenities' => Amenity::select('id', 'name', 'category')->get()->groupBy('category'),
            'bedroom_options' => [1, 2, 3, 4, 5, 6],
            'bathroom_options' => [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
        ];

        return response()->json($options);
    }
}
