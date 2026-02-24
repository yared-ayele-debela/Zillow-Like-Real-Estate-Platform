<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\User;
use App\Services\RatingCalculationService;
use Illuminate\Http\Request;

class AgentController extends Controller
{
    protected RatingCalculationService $ratingService;

    public function __construct(RatingCalculationService $ratingService)
    {
        $this->ratingService = $ratingService;
    }

    /**
     * Display public agent profile details and properties.
     */
    public function show(Request $request, string $id)
    {
        $agent = User::select([
            'id',
            'name',
            'email',
            'phone',
            'bio',
            'avatar',
            'company_name',
            'license_number',
            'role',
            'is_verified',
            'created_at',
        ])
            ->whereIn('role', ['agent', 'admin'])
            ->findOrFail($id);

        $propertiesQuery = Property::with([
            'images' => function ($query) {
                $query->orderBy('order')->orderBy('is_primary', 'desc');
            },
            'amenities',
        ])
            ->where('user_id', $agent->id)
            ->where('is_approved', true);

        if ($request->filled('status')) {
            $propertiesQuery->where('status', $request->status);
        }

        $properties = $propertiesQuery
            ->orderBy('created_at', 'desc')
            ->paginate(min((int) $request->get('per_page', 12), 50));

        $stats = [
            'total_properties' => (clone $propertiesQuery)->count(),
            'for_sale' => (clone $propertiesQuery)->where('status', 'for_sale')->count(),
            'for_rent' => (clone $propertiesQuery)->where('status', 'for_rent')->count(),
            'sold' => (clone $propertiesQuery)->where('status', 'sold')->count(),
            'featured' => (clone $propertiesQuery)->where('is_featured', true)->count(),
            'average_price' => round((float) ((clone $propertiesQuery)->avg('price') ?? 0), 2),
        ];

        $ratingSummary = $this->ratingService->getAgentRatingSummary($agent->id);

        return response()->json([
            'agent' => $agent,
            'properties' => $properties,
            'stats' => $stats,
            'rating_summary' => $ratingSummary,
        ]);
    }
}
