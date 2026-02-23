<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AgentDashboardController extends Controller
{
    /**
     * Get agent dashboard data.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();

        // Only agents and admins can access dashboard
        if (!$user->isAgent() && !$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Only agents can access this dashboard.',
            ], 403);
        }

        // Get agent's properties
        $properties = Property::where('user_id', $user->id)
            ->with(['images', 'amenities'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Calculate statistics
        $totalProperties = Property::where('user_id', $user->id)->count();
        $activeListings = Property::where('user_id', $user->id)
            ->where('status', '!=', 'sold')
            ->where('is_approved', true)
            ->count();

        $totalViews = Property::where('user_id', $user->id)->sum('views');
        $totalSaves = Property::where('user_id', $user->id)->sum('saves');

        // Get inquiries (messages received for agent's properties)
        $totalInquiries = Message::whereHas('property', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->orWhere('receiver_id', $user->id)
            ->where('type', 'inquiry')
            ->count();

        // Get recent messages
        $recentMessages = Message::whereHas('property', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->orWhere('receiver_id', $user->id)
            ->with(['sender:id,name,email,avatar', 'property:id,title'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get unread messages count
        $unreadMessages = Message::whereHas('property', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->orWhere('receiver_id', $user->id)
            ->where('is_read', false)
            ->count();

        // Get property performance data (last 30 days)
        $performanceData = Property::where('user_id', $user->id)
            ->select('id', 'title', 'views', 'saves')
            ->orderBy('views', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'statistics' => [
                'total_properties' => $totalProperties,
                'active_listings' => $activeListings,
                'total_views' => $totalViews,
                'total_saves' => $totalSaves,
                'total_inquiries' => $totalInquiries,
                'unread_messages' => $unreadMessages,
            ],
            'recent_properties' => $properties,
            'recent_messages' => $recentMessages,
            'performance_data' => $performanceData,
        ]);
    }
}
