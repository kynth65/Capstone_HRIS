<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;



class ChatController extends Controller
{
    public function getMessages(Request $request, User $user)
    {
        $messages = Message::with(['sender', 'receiver'])
            ->whereIn('sender_id', [$request->user()->user_id, $user->user_id])
            ->whereIn('receiver_id', [$request->user()->user_id, $user->user_id])
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark messages as read
        Message::where('sender_id', $user->user_id)
            ->where('receiver_id', $request->user()->user_id)
            ->where('read', false)
            ->update(['read' => true]);

        return response()->json($messages);
    }

    public function sendMessage(Request $request)
    {
        try {
            DB::beginTransaction();

            $message = Message::create([
                'sender_id' => $request->sender_id,
                'receiver_id' => $request->receiver_id,
                'message' => $request->message,
                'read' => false
            ]);

            // Load relationships
            $message->load(['sender', 'receiver']);

            // Log before broadcasting
            Log::info('Preparing to broadcast message:', [
                'message_id' => $message->id,
                'sender_id' => $message->sender_id,
                'receiver_id' => $message->receiver_id
            ]);

            // Broadcast event
            broadcast(new MessageSent($message))->toOthers();

            DB::commit();

            // Log after successful broadcast
            Log::info('Message broadcast completed');

            return response()->json($message);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in sendMessage:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    public function getUsers(Request $request)
    {
        $users = User::where('user_id', '!=', $request->user()->user_id)
            ->select('user_id', 'name', 'position', 'department')
            ->get();

        foreach ($users as $user) {
            // Get last message and unread count
            $lastMessage = Message::where(function ($query) use ($request, $user) {
                $query->where('sender_id', $request->user()->user_id)
                    ->where('receiver_id', $user->user_id);
            })->orWhere(function ($query) use ($request, $user) {
                $query->where('sender_id', $user->user_id)
                    ->where('receiver_id', $request->user()->user_id);
            })
                ->latest()
                ->first();

            $unreadCount = Message::where('sender_id', $user->user_id)
                ->where('receiver_id', $request->user()->user_id)
                ->where('read', false)
                ->count();

            $user->last_message = $lastMessage;
            $user->unread_count = $unreadCount;
        }

        return response()->json($users);
    }

    public function markAsRead(Request $request, $userId)
    {
        try {
            // Use $request->user() instead of auth()->user()
            Message::where('sender_id', $userId)
                ->where('receiver_id', $request->user()->user_id)
                ->where('read', false)
                ->update(['read' => true]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error marking messages as read:', [
                'error' => $e->getMessage(),
                'user_id' => $userId
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error marking messages as read'
            ], 500);
        }
    }
}
