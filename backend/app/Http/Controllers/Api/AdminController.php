<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Property;
use App\Models\Review;
use App\Models\Message;
use App\Models\Location;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get admin dashboard statistics.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        // Overall statistics
        $totalUsers = User::count();
        $totalProperties = Property::count();
        $activeListings = Property::where('status', '!=', 'sold')
            ->where('is_approved', true)
            ->count();
        $pendingApprovals = Property::where('is_approved', false)->count();
        $pendingReviews = Review::where('is_approved', false)->count();
        $totalMessages = Message::count();
        $totalInquiries = Message::where('type', 'inquiry')->count();

        // User statistics by role
        $usersByRole = User::select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->pluck('count', 'role');

        // Property statistics by status
        $propertiesByStatus = Property::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        // Property statistics by type
        $propertiesByType = Property::select('property_type', DB::raw('count(*) as count'))
            ->groupBy('property_type')
            ->pluck('count', 'property_type');

        // Recent activity (last 7 days)
        $recentProperties = Property::with(['user:id,name', 'images'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentUsers = User::orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        // Popular locations (top cities)
        $popularLocations = Property::select('city', 'state', DB::raw('count(*) as count'))
            ->groupBy('city', 'state')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'statistics' => [
                'total_users' => $totalUsers,
                'total_properties' => $totalProperties,
                'active_listings' => $activeListings,
                'pending_approvals' => $pendingApprovals,
                'pending_reviews' => $pendingReviews,
                'total_messages' => $totalMessages,
                'total_inquiries' => $totalInquiries,
            ],
            'users_by_role' => $usersByRole,
            'properties_by_status' => $propertiesByStatus,
            'properties_by_type' => $propertiesByType,
            'popular_locations' => $popularLocations,
            'recent_properties' => $recentProperties,
            'recent_users' => $recentUsers,
        ]);
    }

    /**
     * Get all users with filters.
     */
    public function users(Request $request)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $query = User::query();

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    /**
     * Update user.
     */
    public function updateUser(Request $request, string $id)
    {
        $admin = $request->user();

        if (!$admin->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role' => 'sometimes|in:admin,agent,buyer,guest',
            'is_active' => 'sometimes|boolean',
            'is_verified' => 'sometimes|boolean',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->update($request->only([
            'name', 'email', 'role', 'is_active', 'is_verified', 'phone', 'bio'
        ]));

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Delete user (soft delete).
     */
    public function deleteUser(Request $request, string $id)
    {
        $admin = $request->user();

        if (!$admin->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $user = User::findOrFail($id);

        // Prevent deleting yourself
        if ($user->id === $admin->id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 400);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }

    /**
     * Get all properties with filters.
     */
    public function properties(Request $request)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $query = Property::with(['user:id,name,email', 'images']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by approval
        if ($request->has('is_approved')) {
            $isApproved = filter_var($request->is_approved, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_approved', $isApproved);
        }

        // Filter by featured
        if ($request->has('is_featured')) {
            $isFeatured = filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_featured', $isFeatured);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        $properties = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($properties);
    }

    /**
     * Approve property.
     */
    public function approveProperty(Request $request, string $id)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $property = Property::findOrFail($id);
        $property->update(['is_approved' => true]);

        // TODO: Send notification to agent

        return response()->json([
            'message' => 'Property approved successfully',
            'property' => $property->fresh(['user', 'images']),
        ]);
    }

    /**
     * Reject property.
     */
    public function rejectProperty(Request $request, string $id)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $property = Property::findOrFail($id);
        $property->update(['is_approved' => false]);

        // TODO: Send notification to agent with reason

        return response()->json([
            'message' => 'Property rejected',
            'property' => $property->fresh(['user', 'images']),
        ]);
    }

    /**
     * Toggle featured status.
     */
    public function featureProperty(Request $request, string $id)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $property = Property::findOrFail($id);
        $property->update(['is_featured' => !$property->is_featured]);

        return response()->json([
            'message' => $property->is_featured ? 'Property featured successfully' : 'Property unfeatured successfully',
            'property' => $property->fresh(['user', 'images']),
        ]);
    }

    /**
     * Get pending reviews.
     */
    public function pendingReviews(Request $request)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $reviews = Review::where('is_approved', false)
            ->with(['user:id,name,avatar', 'property:id,title', 'agent:id,name'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($reviews);
    }

    /**
     * Approve review.
     */
    public function approveReview(Request $request, string $id)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $review = Review::findOrFail($id);
        $review->update(['is_approved' => true]);

        // Recalculate ratings
        if ($review->property_id) {
            app(\App\Services\RatingCalculationService::class)
                ->recalculatePropertyRating($review->property_id);
        } elseif ($review->agent_id) {
            app(\App\Services\RatingCalculationService::class)
                ->recalculateAgentRating($review->agent_id);
        }

        return response()->json([
            'message' => 'Review approved successfully',
            'review' => $review->fresh(['user', 'property', 'agent']),
        ]);
    }

    /**
     * Reject review.
     */
    public function rejectReview(Request $request, string $id)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $review = Review::findOrFail($id);
        $propertyId = $review->property_id;
        $agentId = $review->agent_id;

        $review->delete();

        // Recalculate ratings
        if ($propertyId) {
            app(\App\Services\RatingCalculationService::class)
                ->recalculatePropertyRating($propertyId);
        } elseif ($agentId) {
            app(\App\Services\RatingCalculationService::class)
                ->recalculateAgentRating($agentId);
        }

        return response()->json([
            'message' => 'Review rejected and deleted',
        ]);
    }

    /**
     * Get location management data.
     */
    public function locations(Request $request)
    {
        $onlyActive = $request->boolean('active_only', false);

        $query = Location::query()
            ->orderBy('state')
            ->orderBy('sort_order')
            ->orderBy('city');

        if ($onlyActive) {
            $query->where('is_active', true);
        }

        $locations = $query->get();

        return response()->json([
            'locations' => $locations,
            'states' => $locations->pluck('state')->unique()->values(),
            'cities' => $locations->pluck('city')->unique()->values(),
            'grouped' => $locations->groupBy('state')->map(fn($items) => $items->values()),
        ]);
    }

    /**
     * Create a managed location.
     */
    public function storeLocation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'state' => 'required|string|max:120',
            'city' => 'required|string|max:120',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $state = strtoupper(trim($request->state));
        $city = trim($request->city);

        $exists = Location::where('state', $state)->where('city', $city)->exists();
        if ($exists) {
            return response()->json([
                'message' => 'Location already exists.',
            ], 422);
        }

        $location = Location::create([
            'state' => $state,
            'city' => $city,
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->get('sort_order', 0),
        ]);

        return response()->json([
            'message' => 'Location created successfully',
            'location' => $location,
        ], 201);
    }

    /**
     * Update a managed location.
     */
    public function updateLocation(Request $request, string $id)
    {
        $location = Location::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'state' => 'sometimes|string|max:120',
            'city' => 'sometimes|string|max:120',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $state = $request->has('state') ? strtoupper(trim($request->state)) : $location->state;
        $city = $request->has('city') ? trim($request->city) : $location->city;

        $exists = Location::where('state', $state)
            ->where('city', $city)
            ->where('id', '!=', $location->id)
            ->exists();
        if ($exists) {
            return response()->json([
                'message' => 'Location already exists.',
            ], 422);
        }

        $data = $request->only(['is_active', 'sort_order']);
        $data['state'] = $state;
        $data['city'] = $city;

        $location->update($data);

        return response()->json([
            'message' => 'Location updated successfully',
            'location' => $location->fresh(),
        ]);
    }

    /**
     * Delete a managed location.
     */
    public function deleteLocation(string $id)
    {
        $location = Location::findOrFail($id);
        $location->delete();

        return response()->json([
            'message' => 'Location deleted successfully',
        ]);
    }

    /**
     * Sync managed locations from existing properties.
     */
    public function syncLocationsFromProperties()
    {
        $propertyLocations = Property::query()
            ->select('state', 'city')
            ->whereNotNull('state')
            ->whereNotNull('city')
            ->distinct()
            ->orderBy('state')
            ->orderBy('city')
            ->get();

        $created = 0;
        foreach ($propertyLocations as $locationData) {
            $state = strtoupper(trim((string) $locationData->state));
            $city = trim((string) $locationData->city);

            if ($state === '' || $city === '') {
                continue;
            }

            $location = Location::firstOrCreate(
                ['state' => $state, 'city' => $city],
                ['is_active' => true]
            );

            if ($location->wasRecentlyCreated) {
                $created++;
            }
        }

        return response()->json([
            'message' => 'Locations synced successfully',
            'created_count' => $created,
            'total_locations' => Location::count(),
        ]);
    }

    /**
     * Get site and email settings.
     */
    public function settings()
    {
        $site = AppSetting::where('key', 'site')->value('value') ?? [];
        $email = AppSetting::where('key', 'email')->value('value') ?? [];

        return response()->json([
            'site' => array_merge([
                'site_name' => 'Zillow Clone',
                'site_description' => 'Real Estate Platform',
                'maintenance_mode' => false,
                'allow_registration' => true,
                'require_email_verification' => true,
            ], $site),
            'email' => array_merge([
                'mail_driver' => 'smtp',
                'mail_host' => 'smtp.mailtrap.io',
                'mail_port' => '2525',
                'mail_username' => '',
                'mail_password' => '',
                'mail_from_address' => 'noreply@example.com',
                'mail_from_name' => 'Zillow Clone',
            ], $email),
        ]);
    }

    /**
     * Update site settings.
     */
    public function updateSiteSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'site_name' => 'required|string|max:120',
            'site_description' => 'nullable|string|max:1000',
            'maintenance_mode' => 'required|boolean',
            'allow_registration' => 'required|boolean',
            'require_email_verification' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $value = $request->only([
            'site_name',
            'site_description',
            'maintenance_mode',
            'allow_registration',
            'require_email_verification',
        ]);

        AppSetting::updateOrCreate(
            ['key' => 'site'],
            ['value' => $value]
        );

        return response()->json([
            'message' => 'Site settings saved successfully',
            'site' => $value,
        ]);
    }

    /**
     * Update email settings.
     */
    public function updateEmailSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mail_driver' => 'required|string|max:50',
            'mail_host' => 'required|string|max:255',
            'mail_port' => 'required|string|max:10',
            'mail_username' => 'nullable|string|max:255',
            'mail_password' => 'nullable|string|max:255',
            'mail_from_address' => 'required|email|max:255',
            'mail_from_name' => 'required|string|max:120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $value = $request->only([
            'mail_driver',
            'mail_host',
            'mail_port',
            'mail_username',
            'mail_password',
            'mail_from_address',
            'mail_from_name',
        ]);

        AppSetting::updateOrCreate(
            ['key' => 'email'],
            ['value' => $value]
        );

        return response()->json([
            'message' => 'Email settings saved successfully',
            'email' => $value,
        ]);
    }

    /**
     * Get analytics data.
     */
    public function analytics(Request $request)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        // Property statistics
        $propertyStats = [
            'total' => Property::count(),
            'approved' => Property::where('is_approved', true)->count(),
            'pending' => Property::where('is_approved', false)->count(),
            'featured' => Property::where('is_featured', true)->count(),
            'for_sale' => Property::where('status', 'for_sale')->count(),
            'for_rent' => Property::where('status', 'for_rent')->count(),
            'sold' => Property::where('status', 'sold')->count(),
        ];

        // User statistics
        $userStats = [
            'total' => User::count(),
            'agents' => User::where('role', 'agent')->count(),
            'buyers' => User::where('role', 'buyer')->count(),
            'active' => User::where('is_active', true)->count(),
            'verified' => User::where('is_verified', true)->count(),
        ];

        // Popular locations
        $popularLocations = Property::select('city', 'state', DB::raw('count(*) as count'))
            ->groupBy('city', 'state')
            ->orderBy('count', 'desc')
            ->limit(20)
            ->get();

        // Properties by month (last 12 months)
        $propertiesByMonth = Property::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('count(*) as count')
        )
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Users by month (last 12 months)
        $usersByMonth = User::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('count(*) as count')
        )
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'property_stats' => $propertyStats,
            'user_stats' => $userStats,
            'popular_locations' => $popularLocations,
            'properties_by_month' => $propertiesByMonth,
            'users_by_month' => $usersByMonth,
        ]);
    }
}
