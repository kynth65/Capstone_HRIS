<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Exception;

class UpdateProfileIcon extends Controller
{
    public function updateProfile(Request $request)
    {
        try {
            $user = Auth::user();

            // Validate the request
            $request->validate([
                'name' => 'nullable|string|max:255',
                'email' => 'nullable|string|email|max:255|unique:users,email,' . $user->user_id . ',user_id',
                'contact_number' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'gender' => 'nullable|in:Male,Female',
                'profile' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Handle file upload
            if ($request->hasFile('profile')) {
                // Delete the old profile picture if it exists
                if ($user->profile) {
                    Storage::disk('public')->delete('images/' . $user->profile);
                }

                // Store the new profile picture
                $file = $request->file('profile');
                $filename = time() . $file->getClientOriginalName();
                $path = $file->storeAs('images', $filename, 'public');

                // Update the profile picture path in the database
                $user->profile = $filename;
            }

            /** @var User $user */

            // Update user details
            $user->name = $request->name;
            $user->email = $request->email;
            $user->contact_number = $request->contact_number;
            $user->address = $request->address;
            $user->gender = $request->gender;

            // Save the updated user information to the database
            $user->save();

            // Generate the full URL for the profile picture
            $user->profile = $user->profile ? asset('storage/images/' . $user->profile) : null;

            return response()->json(['user' => $user]);
        } catch (Exception $e) {
            // Log the error
            Log::error('Error updating profile: ' . $e->getMessage());

            return response()->json(['error' => 'Failed to update profile. Please try again later.'], 500);
        }
    }
}
