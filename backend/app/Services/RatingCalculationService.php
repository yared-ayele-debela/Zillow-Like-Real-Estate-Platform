<?php

namespace App\Services;

use App\Models\Property;
use App\Models\User;
use App\Models\Review;
use Illuminate\Support\Facades\Cache;

class RatingCalculationService
{
    /**
     * Get rating summary for a property.
     */
    public function getPropertyRatingSummary(int $propertyId): array
    {
        $cacheKey = "property_rating_summary:{$propertyId}";
        
        return Cache::remember($cacheKey, 3600, function () use ($propertyId) {
            $reviews = Review::where('property_id', $propertyId)
                ->where('is_approved', true)
                ->get();

            return $this->calculateSummary($reviews);
        });
    }

    /**
     * Get rating summary for an agent.
     */
    public function getAgentRatingSummary(int $agentId): array
    {
        $cacheKey = "agent_rating_summary:{$agentId}";
        
        return Cache::remember($cacheKey, 3600, function () use ($agentId) {
            $reviews = Review::where('agent_id', $agentId)
                ->where('is_approved', true)
                ->get();

            return $this->calculateSummary($reviews);
        });
    }

    /**
     * Calculate rating summary from reviews.
     */
    protected function calculateSummary($reviews): array
    {
        $total = $reviews->count();
        
        if ($total === 0) {
            return [
                'average_rating' => 0,
                'total_reviews' => 0,
                'rating_distribution' => [
                    5 => 0,
                    4 => 0,
                    3 => 0,
                    2 => 0,
                    1 => 0,
                ],
                'percentage_distribution' => [
                    5 => 0,
                    4 => 0,
                    3 => 0,
                    2 => 0,
                    1 => 0,
                ],
            ];
        }

        $average = round($reviews->avg('rating'), 1);
        
        $distribution = [
            5 => 0,
            4 => 0,
            3 => 0,
            2 => 0,
            1 => 0,
        ];

        foreach ($reviews as $review) {
            $distribution[$review->rating]++;
        }

        $percentageDistribution = [];
        foreach ($distribution as $rating => $count) {
            $percentageDistribution[$rating] = $total > 0 ? round(($count / $total) * 100, 1) : 0;
        }

        return [
            'average_rating' => $average,
            'total_reviews' => $total,
            'rating_distribution' => $distribution,
            'percentage_distribution' => $percentageDistribution,
        ];
    }

    /**
     * Recalculate and cache property rating.
     */
    public function recalculatePropertyRating(int $propertyId): void
    {
        $cacheKey = "property_rating_summary:{$propertyId}";
        Cache::forget($cacheKey);
        
        // Recalculate and cache
        $this->getPropertyRatingSummary($propertyId);
    }

    /**
     * Recalculate and cache agent rating.
     */
    public function recalculateAgentRating(int $agentId): void
    {
        $cacheKey = "agent_rating_summary:{$agentId}";
        Cache::forget($cacheKey);
        
        // Recalculate and cache
        $this->getAgentRatingSummary($agentId);
    }
}
