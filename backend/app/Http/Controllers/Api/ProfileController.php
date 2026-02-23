<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\ChangePasswordRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Get user profile.
     */
    public function show(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load(['favorites', 'properties']),
        ]);
    }

    /**
     * Update user profile.
     */
    public function update(UpdateProfileRequest $request)
    {
        $user = $request->user();

        // Get all input data
        $updateData = [];

        // Handle regular fields
        $fields = ['name', 'email', 'phone', 'bio', 'company_name', 'license_number'];
        foreach ($fields as $field) {
            if ($request->has($field)) {
                $value = $request->input($field);
                // Convert empty strings to null for nullable fields
                if (in_array($field, ['phone', 'bio', 'company_name', 'license_number']) && $value === '') {
                    $updateData[$field] = null;
                } else {
                    $updateData[$field] = $value;
                }
            }
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $updateData['avatar'] = $path;
        }

        $user->update($updateData);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Change password.
     */
    public function changePassword(ChangePasswordRequest $request)
    {
        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }
}
