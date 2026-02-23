<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Property;
use App\Models\User;
use App\Services\RatingCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    protected RatingCalculationService $ratingService;

    public function __construct(RatingCalculationService $ratingService)
    {
        $this->ratingService = $ratingService;
    }

    /**
     * Get reviews for a property or agent.
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'sometimes|exists:properties,id',
            'agent_id' => 'sometimes|exists:users,id',
            'approved_only' => 'sometimes',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $query = Review::with(['user:id,name,avatar']);

        if ($request->has('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        if ($request->has('agent_id')) {
            $query->where('agent_id', $request->agent_id);
        }

        // Only show approved reviews to non-admins
        // If no user is authenticated, default to approved_only=true
        // Convert string "true"/"false" to boolean
        $approvedOnly = $request->get('approved_only', true);
        if (is_string($approvedOnly)) {
            $approvedOnly = filter_var($approvedOnly, FILTER_VALIDATE_BOOLEAN);
        }

        $user = $request->user();

        // If approved_only is true OR user is not authenticated OR user is not admin, show only approved
        if ($approvedOnly || !$user || !$user->isAdmin()) {
            $query->where('is_approved', true);
        }

        $reviews = $query->orderBy('created_at', 'desc')
            ->paginate(10);

        // Get rating summary
        $summary = null;
        if ($request->has('property_id')) {
            $summary = $this->ratingService->getPropertyRatingSummary($request->property_id);
        } elseif ($request->has('agent_id')) {
            $summary = $this->ratingService->getAgentRatingSummary($request->agent_id);
        }

        return response()->json([
            'reviews' => $reviews,
            'summary' => $summary,
        ]);
    }

    /**
     * Create a new review.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required_without:agent_id|exists:properties,id',
            'agent_id' => 'required_without:property_id|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Check if user already reviewed
        $existingReview = Review::where('user_id', $user->id)
            ->where(function ($query) use ($request) {
                if ($request->has('property_id')) {
                    $query->where('property_id', $request->property_id);
                }
                if ($request->has('agent_id')) {
                    $query->where('agent_id', $request->agent_id);
                }
            })
            ->first();

        if ($existingReview) {
            return response()->json([
                'message' => 'You have already reviewed this property/agent',
            ], 422);
        }

        // Create review (pending approval by default)
        $review = Review::create([
            'user_id' => $user->id,
            'property_id' => $request->property_id ?? null,
            'agent_id' => $request->agent_id ?? null,
            'rating' => $request->rating,
            'review' => $request->review,
            'is_approved' => false, // Requires admin approval
        ]);

        return response()->json([
            'message' => 'Review submitted successfully. It will be published after approval.',
            'review' => $review->load('user:id,name,avatar'),
        ], 201);
    }

    /**
     * Update own review.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $review = Review::findOrFail($id);

        // Check ownership
        if ($review->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'sometimes|integer|min:1|max:5',
            'review' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // If updating, re-queue for approval
        $review->update([
            'rating' => $request->rating ?? $review->rating,
            'review' => $request->has('review') ? $request->review : $review->review,
            'is_approved' => false, // Re-queue for approval
        ]);

        return response()->json([
            'message' => 'Review updated successfully. It will be republished after approval.',
            'review' => $review->fresh()->load('user:id,name,avatar'),
        ]);
    }

    /**
     * Delete own review.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $review = Review::findOrFail($id);

        // Check ownership or admin
        if ($review->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $propertyId = $review->property_id;
        $agentId = $review->agent_id;

        $review->delete();

        // Recalculate ratings
        if ($propertyId) {
            $this->ratingService->recalculatePropertyRating($propertyId);
        }
        if ($agentId) {
            $this->ratingService->recalculateAgentRating($agentId);
        }

        return response()->json([
            'message' => 'Review deleted successfully',
        ]);
    }

    /**
     * Admin: Approve review.
     */
    public function approve(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $review = Review::findOrFail($id);
        $review->update(['is_approved' => true]);

        // Recalculate ratings
        if ($review->property_id) {
            $this->ratingService->recalculatePropertyRating($review->property_id);
        }
        if ($review->agent_id) {
            $this->ratingService->recalculateAgentRating($review->agent_id);
        }

        return response()->json([
            'message' => 'Review approved successfully',
            'review' => $review->fresh()->load('user:id,name,avatar'),
        ]);
    }

    /**
     * Admin: Reject review.
     */
    public function reject(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json([
            'message' => 'Review rejected and deleted',
        ]);
    }
}
