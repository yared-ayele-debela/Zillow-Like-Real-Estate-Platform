<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedSearch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SavedSearchController extends Controller
{
    /**
     * Get user's saved searches.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $savedSearches = $user->savedSearches()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($savedSearches);
    }

    /**
     * Create a new saved search.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'filters' => 'required|array',
            'email_notifications' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        $savedSearch = $user->savedSearches()->create([
            'name' => $request->name,
            'filters' => $request->filters,
            'email_notifications' => $request->email_notifications ?? true,
        ]);

        return response()->json([
            'message' => 'Search saved successfully',
            'saved_search' => $savedSearch,
        ], 201);
    }

    /**
     * Update a saved search.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $savedSearch = $user->savedSearches()->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'filters' => 'sometimes|array',
            'email_notifications' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $savedSearch->update($request->only(['name', 'filters', 'email_notifications']));

        return response()->json([
            'message' => 'Saved search updated successfully',
            'saved_search' => $savedSearch->fresh(),
        ]);
    }

    /**
     * Delete a saved search.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $savedSearch = $user->savedSearches()->findOrFail($id);

        $savedSearch->delete();

        return response()->json([
            'message' => 'Saved search deleted successfully',
        ]);
    }

    /**
     * Get saved search details.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $savedSearch = $user->savedSearches()->findOrFail($id);

        return response()->json($savedSearch);
    }
}
