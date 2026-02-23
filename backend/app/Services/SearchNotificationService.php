<?php

namespace App\Services;

use App\Models\SavedSearch;
use App\Models\Property;
use App\Services\PropertySearchService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SearchNotificationService
{
    protected PropertySearchService $searchService;

    public function __construct(PropertySearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    /**
     * Check all saved searches for new matches.
     */
    public function checkAllSavedSearches(): void
    {
        $savedSearches = SavedSearch::where('email_notifications', true)
            ->whereHas('user', function ($query) {
                $query->where('is_active', true);
            })
            ->get();

        foreach ($savedSearches as $savedSearch) {
            $this->checkNewMatches($savedSearch);
        }
    }

    /**
     * Check for new properties matching a saved search.
     */
    public function checkNewMatches(SavedSearch $savedSearch): array
    {
        $filters = $savedSearch->filters;
        
        // Add filter to only get properties created after last notification
        if ($savedSearch->last_notified_at) {
            $filters['created_after'] = $savedSearch->last_notified_at->toDateTimeString();
        } else {
            // If never notified, only get properties created after saved search was created
            $filters['created_after'] = $savedSearch->created_at->toDateTimeString();
        }

        // Build query with filters
        $query = $this->searchService->buildSearchQuery($filters);
        
        // Filter by created_at if specified
        if (isset($filters['created_after'])) {
            $query->where('created_at', '>', $filters['created_after']);
        }

        $newProperties = $query->limit(10)->get();

        if ($newProperties->count() > 0) {
            $this->sendNotification($savedSearch, $newProperties);
            $savedSearch->update(['last_notified_at' => now()]);
        }

        return $newProperties->toArray();
    }

    /**
     * Send email notification for new matches.
     */
    protected function sendNotification(SavedSearch $savedSearch, $properties): void
    {
        $user = $savedSearch->user;

        try {
            // TODO: Create a Mailable class for search notifications
            // For now, we'll just log it
            Log::info('New properties found for saved search', [
                'saved_search_id' => $savedSearch->id,
                'user_id' => $user->id,
                'properties_count' => $properties->count(),
            ]);

            // In production, you would send an email:
            // Mail::to($user->email)->send(new NewPropertiesFoundMail($savedSearch, $properties));
        } catch (\Exception $e) {
            Log::error('Failed to send search notification', [
                'saved_search_id' => $savedSearch->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Notify users about price drops on favorited properties.
     */
    public function notifyPriceDrops(): void
    {
        // Get properties with recent price changes
        $properties = Property::whereNotNull('price_history')
            ->where('is_approved', true)
            ->get();

        foreach ($properties as $property) {
            $priceHistory = $property->price_history ?? [];
            
            if (count($priceHistory) < 2) {
                continue; // Need at least 2 entries to detect price drop
            }

            $latest = end($priceHistory);
            $previous = $priceHistory[count($priceHistory) - 2];

            // Check if price dropped
            if ($latest['price'] < $previous['price']) {
                $this->notifyFavoritedUsers($property, $latest['price'], $previous['price']);
            }
        }
    }

    /**
     * Notify users who favorited a property about price drop.
     */
    protected function notifyFavoritedUsers(Property $property, float $newPrice, float $oldPrice): void
    {
        $users = $property->favorites;

        foreach ($users as $user) {
            try {
                // TODO: Create a Mailable class for price drop notifications
                Log::info('Price drop notification', [
                    'property_id' => $property->id,
                    'user_id' => $user->id,
                    'old_price' => $oldPrice,
                    'new_price' => $newPrice,
                ]);

                // In production, you would send an email:
                // Mail::to($user->email)->send(new PriceDropMail($property, $oldPrice, $newPrice));
            } catch (\Exception $e) {
                Log::error('Failed to send price drop notification', [
                    'property_id' => $property->id,
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
