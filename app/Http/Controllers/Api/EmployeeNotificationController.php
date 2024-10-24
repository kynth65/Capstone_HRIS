<?php
// app/Http/Controllers/Api/EmployeeNotificationController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;


class EmployeeNotificationController extends Controller
{
    public function index()
    {
        try {
            $userId = Auth::id();
            Log::info('Fetching notifications for user:', ['user_id' => $userId]);

            $notifications = DB::table('employee_notifications')
                ->where('user_id', $userId)
                ->select('id', 'type', 'message', 'created_at', 'isRead', 'data')
                ->orderBy('created_at', 'desc')
                ->get();

            // Convert 'created_at' to the Asia/Kuala_Lumpur timezone
            $notifications = $notifications->map(function ($notification) {
                $notification->created_at = Carbon::parse($notification->created_at)
                    ->timezone('Asia/Kuala_Lumpur')
                    ->format('Y-m-d H:i:s');
                return $notification;
            });

            Log::info('Notifications fetched successfully', ['count' => $notifications->count()]);
            return response()->json($notifications);
        } catch (\Exception $e) {
            Log::error('Error fetching notifications:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'An error occurred while fetching notifications.'], 500);
        }
    }


    public function markAsRead($id)
    {
        try {
            Log::info('Marking notification as read:', ['notification_id' => $id]);

            $notification = DB::table('employee_notifications')
                ->where('id', $id)
                ->where('user_id', Auth::id())
                ->first();

            if (!$notification) {
                return response()->json(['error' => 'Notification not found'], 404);
            }

            DB::table('employee_notifications')
                ->where('id', $id)
                ->update([
                    'isRead' => true,
                    'read_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'notification' => [
                    'id' => $id,
                    'isRead' => true,
                    'read_at' => now()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error marking notification as read:', [
                'error' => $e->getMessage(),
                'notification_id' => $id
            ]);
            return response()->json(['error' => 'An error occurred while marking notification as read.'], 500);
        }
    }

    public function unreadCount()
    {
        try {
            $userId = Auth::id();
            $count = DB::table('employee_notifications')
                ->where('user_id', $userId)
                ->where('isRead', false)
                ->count();

            return response()->json(['unreadCount' => $count]);
        } catch (\Exception $e) {
            Log::error('Error getting unread count:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'An error occurred while fetching unread count.'], 500);
        }
    }
}
