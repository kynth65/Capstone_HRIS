<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Todo;
use Illuminate\Support\Facades\Log;

class TodoController extends Controller
{


    public function index()
    {
        return Todo::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
    }



    public function store(Request $request)
    {
        // Debug authentication
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Get user ID explicitly
        $userId = Auth::id();

        // Additional debug logging
        Log::info('Creating todo for user:', ['user_id' => $userId]);

        // Validate the request
        $validated = $request->validate([
            'text' => 'required|string|max:255',
            'due_date' => 'required|date',
        ]);

        try {
            // Create todo with explicit user_id
            $todo = Todo::create([
                'user_id' => $userId,
                'text' => $validated['text'],
                'due_date' => $validated['due_date'],
                'completed' => false,
            ]);

            return response()->json($todo, 201);
        } catch (\Exception $e) {
            Log::error('Todo creation failed:', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
                'validated_data' => $validated
            ]);

            return response()->json([
                'message' => 'Failed to create todo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Todo $todo)
    {
        $request->validate([
            'text' => 'sometimes|required|string|max:255',
            'completed' => 'sometimes|required|boolean',
        ]);

        $todo->update($request->only(['text', 'completed']));
        return $todo;
    }

    public function destroy(Todo $todo)
    {
        $todo->delete();
        return response()->noContent();
    }
}
