<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class EventController extends Controller
{


    public function index()
    {
        $events = Event::where('is_active', true)
            ->orderBy('event_date')
            ->get();

        return response()->json($events);
    }

    public function upcoming()
    {
        $events = Event::where('is_active', true)
            ->where('event_date', '>=', now()->subDays(1))
            ->orderBy('event_date')
            ->get()
            ->map(function ($event) {
                // Only decode if it's a string
                $selected_users = is_string($event->selected_users)
                    ? json_decode($event->selected_users)
                    : $event->selected_users;

                $selected_departments = is_string($event->selected_departments)
                    ? json_decode($event->selected_departments)
                    : $event->selected_departments;

                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'type' => $event->type,
                    'icon' => $event->icon ?? null,
                    'event_date' => $event->event_date->format('Y-m-d H:i:s'),
                    'audience' => $event->audience,
                    'with_person' => $event->with_person,
                    'selected_users' => $selected_users ?? [],
                    'selected_departments' => $selected_departments ?? []
                ];
            });

        return response()->json($events);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:' . implode(',', array_keys(Event::TYPES)),
            'event_date' => 'required|date',
            'audience' => 'required|string|in:' . implode(',', array_keys(Event::AUDIENCES)),
            'selected_users' => 'nullable|array',
            'selected_departments' => 'nullable|array'
        ]);

        if (isset($validated['selected_users'])) {
            $validated['selected_users'] = json_encode($validated['selected_users']);
        }
        if (isset($validated['selected_departments'])) {
            $validated['selected_departments'] = json_encode($validated['selected_departments']);
        }

        $event = Event::create([
            ...$validated,
            'is_active' => 1,
            'created_by' => Auth::id()
        ]);

        return response()->json($event, 201);
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|in:' . implode(',', array_keys(Event::TYPES)),
            'event_date' => 'sometimes|date',
            'audience' => 'sometimes|string|in:' . implode(',', array_keys(Event::AUDIENCES)),
            'selected_users' => 'nullable|array',
            'selected_departments' => 'nullable|array',
            'with_person' => 'nullable|string'
        ]);

        // Convert arrays to JSON strings before saving
        if (isset($validated['selected_users'])) {
            $validated['selected_users'] = json_encode($validated['selected_users']);
        }
        if (isset($validated['selected_departments'])) {
            $validated['selected_departments'] = json_encode($validated['selected_departments']);
        }

        $event->update($validated);

        return response()->json($event);
    }

    public function destroy(Event $event)
    {
        $event->update(['is_active' => false]);
        return response()->json(null, 204);
    }
}
