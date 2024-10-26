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
use Illuminate\Support\Str;


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

        $user = $request->user();
        $userId = $user->user_id;
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);

        // Calculate the number of days, including both start and end date
        $daysRequested = $startDate->diffInDays($endDate) + 1; // Include start and end dates

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
            'file_name' => $originalFileName,
            'remarks' => $request->input('remarks') ?? null,
        ]);

        // Create notification for HR
        Notification::create([
            'type' => 'new_leave_request',
            'notifiable_id' => $leaveRequest->id, // Assuming you want to associate this with the leave request
            'notifiable_type' => LeaveRequest::class,
            'user_id' => null, // This can be null if it's not specific to a user
            'message' => "New leave request from {$user->name}",
            'data' => json_encode([
                'employee_name' => $user->name,
                'employee_id' => $userId,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'days_requested' => $daysRequested,
                'leave_request_id' => $leaveRequest->id,
            ]),
            'isRead' => false,
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

            // Check if the requested days exceed the available leave balance
            if ($user->sick_leave_balance >= $leaveRequest->days_requested) {
                // Deduct the requested days from the balance
                $user->sick_leave_balance -= $leaveRequest->days_requested;
            } else {
                // Set the leave balance to 0 if the requested days exceed available balance
                $user->sick_leave_balance = 0;
            }

            // Update the leave request status to 'approved'
            $leaveRequest->statuses = 'approved';
            $leaveRequest->save();

            // Save the updated user balance
            $user->save();

            EmployeeNotification::create([
                'id' => Str::uuid(),
                'user_id' => $leaveRequest->user_id,
                'type' => 'leave_response',
                'message' => "Your leave request for {$leaveRequest->days_requested} day(s) has been approved.",
                'data' => json_encode([
                    'leave_request_id' => $leaveRequest->id,
                    'days_requested' => $leaveRequest->days_requested,
                    'status' => 'approved',
                    'remaining_balance' => $user->sick_leave_balance,
                    'start_date' => $leaveRequest->start_date,
                    'end_date' => $leaveRequest->end_date
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json(['message' => 'Leave request approved successfully']);
        } catch (\Exception $e) {
            Log::error('Error approving leave request: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while approving the leave request.'], 500);
        }
    }


    public function declineLeave($requestId, Request $request)
    {
        if (!$requestId) {
            Log::error('Request ID is null.');
            return response()->json(['error' => 'Invalid request ID.'], 400);
        }

        try {
            $leaveRequest = LeaveRequest::findOrFail($requestId);
            // Update the leave request status and remarks
            $leaveRequest->statuses = 'declined';
            $leaveRequest->remarks = $request->input('remarks'); // Save the remarks
            $leaveRequest->save();

            EmployeeNotification::create([
                'id' => Str::uuid(),
                'user_id' => $leaveRequest->user_id,
                'type' => 'leave_response',
                'message' => "Your leave request has been declined." .
                    ($request->input('remarks') ? " Reason: " . $request->input('remarks') : ""),
                'data' => json_encode([
                    'leave_request_id' => $leaveRequest->id,
                    'days_requested' => $leaveRequest->days_requested,
                    'status' => 'declined',
                    'remarks' => $request->input('remarks'),
                    'start_date' => $leaveRequest->start_date,
                    'end_date' => $leaveRequest->end_date
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json(['message' => 'Leave request declined successfully']);
        } catch (\Exception $e) {
            Log::error('Error declining leave request: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while declining the leave request.'], 500);
        }
    }

    public function getLeaveRequestStatus(Request $request)
    {
        try {
            $userId = Auth::id();
            // Include the 'remarks' field in the select query
            $leaveRequests = LeaveRequest::where('user_id', $userId)
                ->select('file_name', 'statuses', 'file_path', 'start_date', 'end_date', 'days_requested', 'remarks')
                ->get();

            $approvedLeaveRequests = $leaveRequests->where('statuses', 'approved');
            $declinedLeaveRequests = $leaveRequests->where('statuses', 'declined');
            $pendingLeaveRequests = $leaveRequests->where('statuses', 'pending');

            return response()->json([
                'approvedLeaveRequests' => $approvedLeaveRequests,
                'declinedLeaveRequests' => $declinedLeaveRequests,
                'pendingLeaveRequests' => $pendingLeaveRequests,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching leave request status: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while fetching leave request status.'], 500);
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
