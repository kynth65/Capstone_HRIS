<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OnboardingStep;

use App\Models\ResumeRanking;
use App\Models\Candidate;
use Illuminate\Support\Facades\Log; // Import the Log facade

class OnboardingController extends Controller
{
    public function toOnboarding($ranking_id)
    {
        try {
            // Find the employee using ranking_id, and throw an exception if not found
            $employee = ResumeRanking::findOrFail($ranking_id);

            // Archive the employee by creating a new Candidate record
            Candidate::create([
                'name' => $employee->name,
                'email' => $employee->email,
                'job_position' => $employee->position_name,
            ]);

            // Delete the employee from the resume rankings
            $employee->delete();

            return response()->json(['message' => 'Employee successfully onboarded and archived.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Log the error if the employee was not found
            Log::error('Employee not found.', ['candidate_id' => $ranking_id]);

            return response()->json(['message' => 'Employee not found.'], 404);
        } catch (\Exception $e) {
            // Log any other exceptions
            Log::error('Failed to onboard and archive employee.', [
                'candidate_id' => $ranking_id,
                'exception' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Failed to onboard and archive employee.'], 500);
        }
    }


    public function removeCandidate($ranking_id)
    {
        // Again, find the employee using ranking_id
        $employee = ResumeRanking::findOrFail($ranking_id);

        if (!$employee) {
            Log::error('Candidate not found for removal.', ['ranking_id' => $ranking_id]);
            return response()->json(['message' => 'Candidate not found.'], 404);
        }

        try {
            $employee->delete();
            return response()->json(['message' => 'Candidate successfully removed.']);
        } catch (\Exception $e) {
            Log::error('Failed to remove candidate.', [
                'ranking_id' => $ranking_id,
                'exception' => $e->getMessage()
            ]);

            return response()->json(['message' => 'Failed to remove candidate.'], 500);
        }
    }
}
