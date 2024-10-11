<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\LeaveRequest;
use App\Models\Notification;
use App\Http\Controllers\Controller;
use App\Models\EmployeeNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class SubmitLeaveRequest extends Controller
{
    public function submitLeaveRequest(Request $request)
    {
        // Validate the request
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $userId = $request->user()->user_id;
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);

        // Calculate the number of days
        $daysRequested = $endDate->diffInDays($startDate);

        // Check if user has enough leave days
        $user = User::find($userId);
        if ($user->leave < $daysRequested) {
            return response()->json([
                'error' => 'Insufficient leave balance. You have ' . $user->leave . ' days available.'
            ], 400);
        }

        $originalFileNameWithExt = $request->file('file')->getClientOriginalName();
        $originalFileName = pathinfo($originalFileNameWithExt, PATHINFO_FILENAME);
        $filePath = $request->file('file')->store('leave_requests', 'public');

        // Create the leave request
        $leaveRequest = LeaveRequest::create([
            'user_id' => $userId,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'days_requested' => $daysRequested,
            'statuses' => 'pending',
            'file_path' => $filePath,
            'file_name' => $originalFileName
        ]);

        return response()->json(['message' => 'Leave request submitted successfully']);
    }

    public function getLeaveRequests(Request $request)
    {
        try {
            $user = Auth::user(); // Get the authenticated user

            if (!$user) {
                // If no user is authenticated, return an appropriate response
                return response()->json([
                    'error' => 'User is not authenticated.',
                ], 401); // Unauthorized
            }

            $userId = $user->id; // Use $user->id instead of $userId

            // Retrieve only the specified columns from the leave_requests table where user_id matches
            $leaveRequests = LeaveRequest::where('user_id', $userId)
                ->select('file_name', 'statuses', 'file_path') // Add any other columns you need
                ->get();

            return response()->json([
                'leaveRequests' => $leaveRequests,
            ]);
        } catch (\Exception $e) {
            // Log the error details
            Log::error('Error fetching leave requests: ' . $e->getMessage());

            // Return a JSON response with the error message
            return response()->json([
                'error' => 'An error occurred while fetching leave requests.',
            ], 500);
        }
    }


    public function approveLeave($requestId)
    {
        try {
            $leaveRequest = LeaveRequest::findOrFail($requestId);
            $user = User::findOrFail($leaveRequest->user_id);

            // Check if the user has sufficient leave balance
            // Use abs() to compare correctly since days_requested is negative
            if ($user->leave < abs($leaveRequest->days_requested)) {
                return response()->json(['error' => 'Insufficient leave balance.'], 400);
            }

            // Update the leave request status
            $leaveRequest->statuses = 'approved';
            $leaveRequest->save();

            // Update the user's leave balance using abs() to subtract the correct amount
            $user->leave -= abs($leaveRequest->days_requested);
            $user->save();

            // Add debug statements to see if the leave field is being updated
            Log::info('Leave field after update: ' . $user->leave);

            return response()->json(['message' => 'Leave request approved successfully']);
        } catch (\Exception $e) {
            Log::error('Error approving leave request: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while approving the leave request.'], 500);
        }
    }

    public function declineLeave($requestId)
    {
        try {
            $leaveRequest = LeaveRequest::findOrFail($requestId);

            // Update the leave request status
            $leaveRequest->statuses = 'declined';
            $leaveRequest->save();

            // Notify the employee
            //  EmployeeNotification::create([
            //     'message' => 'Your leave request has been declined.',
            //    'created_at' => now(),
            //     'updated_at' => now(),
            // ]);

            return response()->json(['message' => 'Leave request declined successfully']);
        } catch (\Exception $e) {
            Log::error('Error declining leave request: ' . $e->getMessage(), [
                'request_id' => $requestId,
                'exception' => $e
            ]);

            return response()->json(['error' => 'An error occurred while declining the leave request.'], 500);
        }
    }

    public function getLeaveRequestStatus(Request $request)
    {
        try {
            $userId = Auth::id();

            // Update the selected columns to include date fields
            $leaveRequests = LeaveRequest::where('user_id', $userId)
                ->select('file_name', 'statuses', 'file_path', 'start_date', 'end_date', 'days_requested')
                ->get();

            $approvedLeaveRequests = $leaveRequests->filter(function ($request) {
                return $request->statuses === 'approved';
            });

            $declinedLeaveRequests = $leaveRequests->filter(function ($request) {
                return $request->statuses === 'declined';
            });

            $pendingLeaveRequests = $leaveRequests->filter(function ($request) {
                return $request->statuses === 'pending';
            });

            return response()->json([
                'approvedLeaveRequests' => $approvedLeaveRequests,
                'declinedLeaveRequests' => $declinedLeaveRequests,
                'pendingLeaveRequests' => $pendingLeaveRequests,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching leave request status: ' . $e->getMessage());
            return response()->json([
                'error' => 'An error occurred while fetching leave request status.',
            ], 500);
        }
    }

    public function updateLeaveBalance($userId, $daysRequested)
    {
        try {
            $user = User::find($userId);

            if (!$user) {
                return response()->json([
                    'error' => 'User  not found.',
                ], 404);
            }

            // Deduct the approved days from the user's leave balance
            $user->leave -= abs($daysRequested); // Changed to subtract daysRequested

            // Check if leave balance is negative (optional)
            if ($user->leave < 0) {
                return response()->json([
                    'error' => 'User  leave balance cannot be negative.',
                ], 400);
            }

            $user->save();

            return response()->json([
                'message' => 'User  leave balance updated successfully.',
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating user leave balance: ' . $e->getMessage());
            return response()->json([
                'error' => 'An error occurred while updating user leave balance.',
            ], 500);
        }
    }
}
