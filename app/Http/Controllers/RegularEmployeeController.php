<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Models\Candidate;
use Illuminate\Support\Facades\Log;

class RegularEmployeeController extends Controller
{
    public function notifyRegularEmployee(Request $request, $candidateId)
    {
        $candidate = Candidate::findOrFail($candidateId);

        // Update candidate's status to reflect regular employment
        $candidate->recruitment_stage = 'regular';  // Ensure you have this column in your database

        $candidate->save();

        // Log the regular employee notification

        Log::info("Regular employee notification sent for candidate: {$candidate->id}, email sent to: {$candidate->email}");

        // Send email to notify that the candidate is now a regular employee
        Mail::to($candidate->email)->send(new \App\Mail\RegularEmployeeMail($candidate));

        return response()->json(['message' => 'Notification email sent successfully']);
    }
}
