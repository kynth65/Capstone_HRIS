<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class AdminNotificationController extends Controller
{
    public function index()
    {
        try {
            Log::info('Fetching admin notifications');
            $notifications = AdminNotification::select([
                'id',
                'type',
                'message',
                'created_at',
                'isRead',
                'data'
            ])
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get()
                ->map(function ($notification) {
                    $notification->created_at = Carbon::parse($notification->created_at)
                        ->timezone('Asia/Kuala_Lumpur')
                        ->format('Y-m-d H:i:s');

                    // Ensure isRead is boolean
                    $notification->isRead = (bool)$notification->isRead;

                    if (!$notification->type && $notification->data) {
                        try {
                            $data = is_array($notification->data) ?
                                $notification->data :
                                json_decode($notification->data, true);
                            $notification->type = $data['type'] ?? null;
                        } catch (\Exception $e) {
                            Log::error('Error parsing notification data', [
                                'notification_id' => $notification->id,
                                'error' => $e->getMessage()
                            ]);
                        }
                    }
                    return $notification;
                });

            Log::info('Notifications fetched:', ['count' => $notifications->count()]);

            return response()->json($notifications);
        } catch (\Exception $e) {
            Log::error('Error fetching admin notifications', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to fetch notifications'], 500);
        }
    }

    public function markAsRead($id)
    {
        try {
            Log::info('Attempting to mark notification as read', ['id' => $id]);

            $notification = AdminNotification::findOrFail($id);

            Log::info('Found notification', [
                'notification' => $notification->toArray()
            ]);

            $updated = $notification->update([
                'isRead' => true,
                'read_at' => now()
            ]);

            Log::info('Update result', ['success' => $updated]);

            return response()->json([
                'message' => 'Notification marked as read',
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Error marking notification as read', [
                'notification_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to mark notification as read',
                'success' => false
            ], 500);
        }
    }

    public function unreadCount()
    {
        try {
            $count = AdminNotification::where('isRead', false)
                ->orWhere('isRead', 0)  // Added this condition
                ->count();

            Log::info('Unread count:', ['count' => $count]); // Add logging

            return response()->json([
                'unreadCount' => $count,
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting unread count', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'error' => 'Failed to get unread count',
                'success' => false
            ], 500);
        }
    }
}
