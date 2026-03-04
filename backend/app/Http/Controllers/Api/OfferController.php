<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OfferController extends Controller
{
    /**
     * List offers for agent's properties (or admin).
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user->isAgent() && !$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. Only agents can access offers.',
            ], 403);
        }

        $query = Offer::with(['property:id,title,address,city,state,price', 'message.sender:id,name,email'])
            ->whereHas('property', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });

        if ($request->filled('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $offers = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($offers);
    }

    /**
     * Store a new offer.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required|exists:properties,id',
            'message_id' => 'nullable|exists:messages,id',
            'amount' => 'required|numeric|min:0',
            'status' => 'sometimes|in:submitted,accepted,rejected,counter',
            'notes' => 'nullable|string|max:5000',
            'submitted_at' => 'nullable|date',
            'responded_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $property = Property::findOrFail($request->property_id);

        if ($property->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized. You can only add offers for your properties.',
            ], 403);
        }

        $data = $validator->validated();
        $data['submitted_at'] = $data['submitted_at'] ?? now();
        $data['status'] = $data['status'] ?? 'submitted';

        $offer = Offer::create($data);

        return response()->json([
            'message' => 'Offer created successfully',
            'offer' => $offer->load(['property:id,title,address,city,state,price', 'message.sender:id,name,email']),
        ], 201);
    }

    /**
     * Show a single offer.
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();
        $offer = Offer::with(['property', 'message.sender', 'message.property'])
            ->findOrFail($id);

        if ($offer->property->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json(['offer' => $offer]);
    }

    /**
     * Update an offer (status, notes, responded_at).
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:submitted,accepted,rejected,counter',
            'notes' => 'nullable|string|max:5000',
            'submitted_at' => 'nullable|date',
            'responded_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $offer = Offer::with('property')->findOrFail($id);

        if ($offer->property->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $data = $validator->validated();
        if (isset($data['status']) && in_array($data['status'], ['accepted', 'rejected'], true) && !$offer->responded_at) {
            $data['responded_at'] = now();
        }

        $offer->update($data);

        return response()->json([
            'message' => 'Offer updated successfully',
            'offer' => $offer->fresh(['property:id,title,address,city,state,price', 'message.sender:id,name,email']),
        ]);
    }

    /**
     * Delete an offer.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();
        $offer = Offer::with('property')->findOrFail($id);

        if ($offer->property->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $offer->delete();

        return response()->json(['message' => 'Offer deleted successfully']);
    }
}
