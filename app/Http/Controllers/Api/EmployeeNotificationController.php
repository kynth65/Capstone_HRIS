<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class EmployeeNotificationController extends Controller
{
    public function index()
    {
        try {
            $userId = Auth::id(); // Get the authenticated user ID

            // Fetch notifications specific to the employee
            $notifications = DB::table('employee_notifications')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get();

            return response()->json($notifications);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while fetching notifications.'], 500);
        }
    }
}
