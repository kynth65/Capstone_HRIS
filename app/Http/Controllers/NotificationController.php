<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class NotificationController extends Controller
{
    public function index()
    {
        try {
            Log::info('Attempting to fetch notifications from database.');
            $notifications = DB::table('notifications')
                ->select('id', 'type', 'message', 'created_at', 'isRead', 'data') // Added type and data fields
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get();

            // Process notifications to ensure type is available and convert timezone
            $notifications = $notifications->map(function ($notification) {
                // Convert created_at to Asia/Kuala_Lumpur timezone
                $notification->created_at = Carbon::parse($notification->created_at)
                    ->timezone('Asia/Kuala_Lumpur')
                    ->format('Y-m-d H:i:s');

                // Handle the type as before
                if (!$notification->type && $notification->data) {
                    try {
                        $data = is_string($notification->data) ?
                            json_decode($notification->data) :
                            $notification->data;

                        if (isset($data->type)) {
                            $notification->type = $data->type;
                        }
                    } catch (\Exception $e) {
                        Log::error('Error parsing notification data', [
                            'notification_id' => $notification->id,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
                return $notification;
            });

            Log::info('Notifications fetched successfully.', ['notifications' => $notifications]);
            return response()->json($notifications);
        } catch (\Exception $e) {
            Log::error('An error occurred while fetching notifications.', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'An error occurred while fetching notifications.'], 500);
        }
    }

    public function markAsRead($id)
    {
        try {
            DB::table('notifications')
                ->where('id', $id)
                ->update(['isRead' => true]);

            return response()->json(['success' => 'Notification marked as read']);
        } catch (\Exception $e) {
            Log::error('An error occurred while marking notification as read.', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'An error occurred while marking notification as read.'], 500);
        }
    }

    public function unreadCount()
    {
        try {
            $unreadCount = DB::table('notifications')
                ->where('isRead', false)
                ->count();

            return response()->json(['unreadCount' => $unreadCount]);
        } catch (\Exception $e) {
            Log::error('An error occurred while fetching unread notifications count.', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'An error occurred while fetching unread notifications count.'], 500);
        }
    }
}
