<?php

namespace App\Http\Controllers;

use App\Models\Incident;
use Illuminate\Http\Request;

class IncidentController extends Controller
{
    // Store a new incident
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date',
            'severity' => 'required|in:low,high,severe',
            'status' => 'required|string|in:pending,investigating,resolved', // Added status validation
            'pdf_file' => 'nullable|file|mimes:pdf|max:2048',
        ]);

        $pdfFilePath = null;
        if ($request->hasFile('pdf_file')) {
            $pdfFilePath = $request->file('pdf_file')->store('incident_reports', 'public');
        }

        $incident = Incident::create([
            'title' => $request->title,
            'description' => $request->description,
            'date' => $request->date,
            'severity' => $request->severity,
            'status' => $request->status, // Store the initial status
            'pdf_file_path' => $pdfFilePath,
        ]);

        return response()->json($incident, 201);
    }

    // Retrieve all incidents
    public function index()
    {
        $incidents = Incident::all();
        return response()->json($incidents);
    }

    // Retrieve a specific incident by ID
    public function show($id)
    {
        $incident = Incident::findOrFail($id);
        return response()->json($incident);
    }

    // Update the status of an existing incident and optionally upload a PDF
    public function update(Request $request, $id)
    {
        $incident = Incident::findOrFail($id);

        $request->validate([
            'status' => 'required|string|in:pending,investigating,resolved', // Only status is required for update
            'pdf_file' => 'nullable|file|mimes:pdf|max:2048',
        ]);

        if ($request->hasFile('pdf_file')) {
            $pdfFilePath = $request->file('pdf_file')->store('incident_reports', 'public');
            $incident->pdf_file_path = $pdfFilePath;
        }

        $incident->status = $request->status;
        $incident->save();

        return response()->json($incident);
    }

    // Delete an incident
    public function destroy($id)
    {
        $incident = Incident::findOrFail($id);
        $incident->delete();

        return response()->json(['message' => 'Incident deleted successfully']);
    }
}
