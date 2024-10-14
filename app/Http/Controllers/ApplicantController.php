<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Applicant;
use Illuminate\Support\Facades\DB;

class ApplicantController extends Controller
{
    // Get all applicants
    public function index()
    {
        return response()->json(Applicant::all(), 200);
    }

    // Get a single applicant by ID
    public function show($id)
    {
        $applicant = Applicant::find($id);

        if (!$applicant) {
            return response()->json(['message' => 'Applicant not found'], 404);
        }

        return response()->json($applicant, 200);
    }

    // Create a new applicant
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:applicants,email',
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:255',
            'resume' => 'nullable|string',
            'google_id' => 'nullable|string|unique:applicants,google_id'
        ]);

        $applicant = Applicant::create($validatedData);

        return response()->json([
            'message' => 'Applicant created successfully',
            'applicant' => $applicant
        ], 201);
    }

    // Update an existing applicant
    public function update(Request $request, $id)
    {
        $applicant = Applicant::find($id);

        if (!$applicant) {
            return response()->json(['message' => 'Applicant not found'], 404);
        }

        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:applicants,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:255',
            'resume' => 'nullable|string',
            'google_id' => 'nullable|string|unique:applicants,google_id,' . $id
        ]);

        $applicant->update($validatedData);

        return response()->json([
            'message' => 'Applicant updated successfully',
            'applicant' => $applicant
        ], 200);
    }

    // Delete an applicant
    public function destroy($id)
    {
        $applicant = Applicant::find($id);

        if (!$applicant) {
            return response()->json(['message' => 'Applicant not found'], 404);
        }

        $applicant->delete();

        return response()->json(['message' => 'Applicant deleted successfully'], 200);
    }

    // Check upload status based on Google ID
    public function checkUploadStatus($google_id)
    {
        $applicant = Applicant::where('google_id', $google_id)->select('has_uploaded')->first();

        if (!$applicant) {
            return response()->json(['message' => 'Applicant not found'], 404);
        }

        return response()->json(['has_uploaded' => $applicant->has_uploaded], 200);
    }

    // Update upload status for an applicant based on Google ID
    public function updateUploadStatus(Request $request)
    {
        $validatedData = $request->validate([
            'google_id' => 'required|string',
            'has_uploaded' => 'required|boolean'
        ]);

        $applicant = Applicant::where('google_id', $validatedData['google_id'])->first();

        if (!$applicant) {
            return response()->json(['message' => 'Applicant not found'], 404);
        }

        $applicant->has_uploaded = $validatedData['has_uploaded'];
        $applicant->save();

        return response()->json(['message' => 'Upload status updated successfully'], 200);
    }
}
