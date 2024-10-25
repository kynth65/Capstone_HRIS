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
            $notification = AdminNotification::findOrFail($id);
            $notification->update([
                'isRead' => true,
                'read_at' => now()
            ]);

            return response()->json(['message' => 'Notification marked as read']);
        } catch (\Exception $e) {
            Log::error('Error marking notification as read', [
                'notification_id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Failed to mark notification as read'], 500);
        }
    }

    public function unreadCount()
    {
        try {
            $count = AdminNotification::where('isRead', false)->count();
            return response()->json(['unreadCount' => $count]);
        } catch (\Exception $e) {
            Log::error('Error getting unread count', [
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Failed to get unread count'], 500);
        }
    }
}
