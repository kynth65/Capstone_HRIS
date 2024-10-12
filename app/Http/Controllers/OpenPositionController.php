<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Position;
use App\Models\ResumeRanking;


class OpenPositionController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'title' => 'required|string|max:255',
                'type' => 'required|string',
                'description' => 'required|string',
                'qualifications' => 'required|string',
                'hr_tags' => 'required|string',
                'base_salary' => 'required|string',
            ]);

            $position = Position::create($validatedData);

            return response()->json(['message' => 'Position created successfully', 'position' => $position], 201);
        } catch (\Exception $e) {
            // Log the exception message
            Log::error('Error creating position: ' . $e->getMessage());

            // Optionally, you can return a more user-friendly response
            return response()->json(['message' => 'An error occurred while creating the position'], 500);
        }
    }
    public function index()
    {
        $positions = Position::all();
        return response()->json($positions);
    }

    public function getHrTags($position_id)
    {
        $openPosition = Position::find($position_id);
        if ($openPosition) {
            return response()->json([
                'hr_tags' => $openPosition->hr_tags,  // Ensure this field exists
                'position_id' => $openPosition->position_id,
            ]);
        }
        return response()->json(['error' => 'Position not found'], 404);
    }
    public function getApplicants($positionId)
    {
        $applicants = ResumeRanking::where('position_id', $positionId)->get();

        return response()->json($applicants);
    }
    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'base_salary' => 'required|numeric',
            'type' => 'required|in:Full-time,Part-time',
            'hr_tags' => 'required',
            'qualifications' => 'required|string',
        ]);

        $position = Position::find($id);

        if (!$position) {
            return response()->json(['error' => 'Position not found'], 404);
        }

        $position->title = $request->input('title');
        $position->description = $request->input('description');
        $position->qualifications = $request->input('qualifications');
        $position->base_salary = $request->input('base_salary');
        $position->type = $request->input('type');
        $position->hr_tags = $request->input('hr_tags');
        $position->save();

        return response()->json(['message' => 'Position updated successfully']);
    }

    public function deletePosition($position_id)
    {
        // Again, find the employee using ranking_id
        $employee = Position::findOrFail($position_id);

        if (!$employee) {
            Log::error('Position not found for removal.', ['position_id' => $position_id]);
            return response()->json(['message' => 'Position not found.'], 404);
        }

        try {
            $employee->delete();
            return response()->json(['message' => 'Position successfully removed.']);
        } catch (\Exception $e) {
            Log::error('Failed to remove candidate.', [
                'position_id' => $position_id,
                'exception' => $e->getMessage()
            ]);

            return response()->json(['message' => 'Failed to remove candidate.'], 500);
        }
    }
}
