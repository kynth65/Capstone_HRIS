<?php

namespace App\Http\Controllers;

use App\Models\Incident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class IncidentController extends Controller
{
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'incident_date' => 'required|date',
            'severity' => 'required|string|in:Low,Medium,High',
            'status' => 'required|string|in:Pending,Investigating,Resolved',
            'file_path' => 'nullable|file|mimes:pdf|max:2048',
            'name' => 'required'
        ]);

        $filePath = null;
        if ($request->hasFile('file_path') && $request->file('file_path')->isValid()) {
            $filename = time() . '.' . $request->file('file_path')->getClientOriginalExtension();
            $filePath = $request->file('file_path')->storeAs('incident_reports', $filename, 'public');
        }

        // Assuming `user_id` is sent with the request or provided by the authenticated user
        $incident = Incident::create([
            'user_id' => $request->input('user_id'), // Set the user ID
            'name' => $request->input("name"),
            'title' => $validatedData['title'],
            'description' => $validatedData['description'],
            'incident_date' => $validatedData['incident_date'],
            'severity' => $validatedData['severity'],
            'status' => $validatedData['status'],
            'file_path' => $filePath,
        ]);

        return response()->json($incident, 201);
    }

    public function index()
    {
        $incidents = Incident::all();
        return response()->json($incidents);
    }

    public function show($id)
    {
        $incident = Incident::findOrFail($id);
        if ($incident->file_path) {
            $incident->file_url = asset('storage/' . $incident->file_path);
        }

        return response()->json($incident);
    }



    public function update(Request $request, $id)
    {
        Log::info("Updating incident with ID: $id");

        $validatedData = $request->validate([
            'status' => 'nullable|string|in:Pending,Investigating,Resolved',
            'file_path' => 'nullable|file|mimes:pdf|max:2048',
        ]);

        $incident = Incident::find($id);

        if (!$incident) {
            Log::warning("Incident not found with ID: $id");
            return response()->json(['error' => 'Incident not found'], 404);
        }

        // Update status if provided
        if (isset($validatedData['status'])) {
            $incident->status = $validatedData['status'];
            Log::info("Updated incident status to: {$validatedData['status']}");
        }

        // Handle file upload if provided
        if ($request->hasFile('file_path')) {
            // Delete old file if exists
            if ($incident->file_path) {
                Storage::disk('public')->delete($incident->file_path);
                Log::info("Deleted old file at: {$incident->file_path}");
            }

            // Store new file and update path
            $path = $request->file('file_path')->store('incident_reports', 'public');
            $incident->file_path = $path;
            Log::info("New file stored at: $path");
        }

        // Save incident changes
        $incident->save();
        Log::info("Incident saved with updated details.");

        return response()->json([
            'message' => 'Incident updated successfully.',
            'incident' => $incident->fresh()
        ]);
    }


    public function destroy($id)
    {
        $incident = Incident::findOrFail($id);
        if ($incident->file_path) {
            Storage::disk('public')->delete($incident->file_path);
        }
        $incident->delete();

        return response()->json(['message' => 'Incident deleted successfully'], 200);
    }
}
