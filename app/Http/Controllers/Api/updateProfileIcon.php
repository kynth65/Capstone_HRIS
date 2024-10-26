<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
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

    public function updatePersonalInfo(Request $request, $userId)
    {
        try {
            // Find the user by user ID
            $user = User::where('user_id', $userId)->first();

            if (!$user) {
                return response()->json(['error' => 'User not found.'], 404);
            }

            // Validate the incoming request data
            $request->validate([
                'email' => 'nullable|string|email|max:255|unique:users,email,' . $user->user_id . ',user_id',
                'date_of_birth' => 'nullable|date',
                'gender' => 'nullable|in:Male,Female,Other',
                'nationality' => 'nullable|string|max:255',
                'marital_status' => 'nullable|in:Single,Married,Divorced,Widowed',
                'contact_number' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'personal_email' => 'nullable|email|max:255',
                'work_email' => 'nullable|email|max:255',
                'home_phone' => 'nullable|string|max:20',
                'emergency_contact_name' => 'nullable|string|max:255',
                'emergency_contact_relationship' => 'nullable|string|max:100',
                'emergency_contact_phone' => 'nullable|string|max:20',
                'hire_date' => 'nullable|date',
                'employee_type' => 'nullable|in:Regular,Temporary,Intern',
                'department' => 'nullable|string|max:255',
                'reporting_manager' => 'nullable|string|max:255',
                'work_location' => 'nullable|string|max:255',
                'current_salary' => 'nullable|numeric|min:0',
                'pay_frequency' => 'nullable|in:Weekly,Bi-weekly,Monthly',
                'schedule' => 'nullable|in:7:00 - 16:00,8:00 - 17:00,12:00 - 21:00',  // Added schedule validation
                'sick_leave_balance' => 'nullable|numeric|min:0', // Added validation for sick_leave_balance
            ]);

            // Update user personal information
            $user->email = $request->email ?? $user->email;
            $user->date_of_birth = $request->date_of_birth ?? $user->date_of_birth;
            $user->gender = $request->gender ?? $user->gender;
            $user->nationality = $request->nationality ?? $user->nationality;
            $user->marital_status = $request->marital_status ?? $user->marital_status;
            $user->contact_number = $request->contact_number ?? $user->contact_number;
            $user->address = $request->address ?? $user->address;
            $user->personal_email = $request->personal_email ?? $user->personal_email;
            $user->work_email = $request->work_email ?? $user->work_email;
            $user->home_phone = $request->home_phone ?? $user->home_phone;
            $user->emergency_contact_name = $request->emergency_contact_name ?? $user->emergency_contact_name;
            $user->emergency_contact_relationship = $request->emergency_contact_relationship ?? $user->emergency_contact_relationship;
            $user->emergency_contact_phone = $request->emergency_contact_phone ?? $user->emergency_contact_phone;

            // Update employment details
            $user->hire_date = $request->hire_date ?? $user->hire_date;
            $user->employee_type = $request->employee_type ?? $user->employee_type;
            $user->department = $request->department ?? $user->department;
            $user->reporting_manager = $request->reporting_manager ?? $user->reporting_manager;
            $user->work_location = $request->work_location ?? $user->work_location;
            $user->current_salary = $request->current_salary ?? $user->current_salary;
            $user->pay_frequency = $request->pay_frequency ?? $user->pay_frequency;
            $user->schedule = $request->schedule ?? $user->schedule;  // Added schedule update
            $user->sick_leave_balance = $request->sick_leave_balance ?? $user->sick_leave_balance;  // Added sick_leave_balance update


            // Save the updated user data
            $user->save();

            return response()->json(['message' => 'Personal information updated successfully!', 'user' => $user]);
        } catch (Exception $e) {
            Log::error('Error updating personal information: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update personal information. Please try again later.'], 500);
        }
    }
}
