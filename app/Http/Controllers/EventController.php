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
            ->where('event_date', '>=', now())
            ->orderBy('event_date')
            ->take(5)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'icon' => $event->icon ?? Event::ICONS[$event->type],
                    'date' => $event->event_date->format('M jS'),
                    'time' => $event->event_date->format('H:i'),
                    'audience' => $event->audience,
                    'with_person' => $event->with_person,
                    'type' => $event->type
                ];
            });

        return response()->json($events);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:' . implode(',', array_keys(Event::TYPES)),
            'icon' => 'nullable|string',
            'event_date' => 'required|date',
            'audience' => 'required|string|in:' . implode(',', array_keys(Event::AUDIENCES)),
            'with_person' => 'nullable|string'
        ]);

        $event = Event::create([
            ...$validated,
            'created_by' => Auth::id(),
        ]);

        return response()->json($event, 201);
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|in:' . implode(',', array_keys(Event::TYPES)),
            'icon' => 'nullable|string',
            'event_date' => 'sometimes|date',
            'audience' => 'sometimes|string|in:' . implode(',', array_keys(Event::AUDIENCES)),
            'with_person' => 'nullable|string'
        ]);

        $event->update($validated);

        return response()->json($event);
    }

    public function destroy(Event $event)
    {
        $event->update(['is_active' => false]);
        return response()->json(null, 204);
    }
}
