<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Models\Candidate;
use Carbon\Carbon;

class ExamController extends Controller
{
    public function examMail(Request $request, $id)
    {
        $candidate = Candidate::findOrFail($id);

        $request->validate([
            'date' => 'required|date',
            'time' => 'required',
        ]);

        // Combine date and time to validate if it's in the future
        $examDateTime = Carbon::createFromFormat('Y-m-d H:i', $request->date . ' ' . $request->time);
        $currentDateTime = Carbon::now('Asia/Manila');

        // Check if the exam time is in the past
        if ($examDateTime->isPast()) {
            return response()->json(['message' => 'The exam schedule must be set for a future time.'], 422);
        }

        // Update candidate's exam schedule
        $candidate->date = $request->date;
        $candidate->time = $request->time;
        $candidate->save();

        Mail::to($candidate->email)->send(new \App\Mail\ExamMail($candidate));

        return response()->json(['message' => 'Exam email sent successfully']);
    }
    public function examPassed(Request $request, $id)
    {
        $candidate = Candidate::findOrFail($id);

        $request->validate([
            'date' => 'required|date',
            'time' => 'required',
        ]);
        $examDateTime = Carbon::createFromFormat('Y-m-d H:i', $request->date . ' ' . $request->time);
        $currentDateTime = Carbon::now('Asia/Manila');

        // Check if the exam time is in the past
        if ($examDateTime->isPast()) {
            return response()->json(['message' => 'The exam schedule must be set for a future time.'], 422);
        }
        // Update candidate's exam schedule
        $candidate->recruitment_stage = "Orientation";
        $candidate->date = $request->date;
        $candidate->time = $request->time;
        $candidate->save();

        Mail::to($candidate->email)->send(new \App\Mail\ExamPassMail($candidate));

        return response()->json(['message' => 'Onboarding email sent successfully']);
    }

    public function examFailed($id)
    {
        $candidate = Candidate::findOrFail($id);

        Mail::to($candidate->email)->send(new \App\Mail\ExamFailedMail($candidate));

        return response()->json(['message' => 'Exam email sent successfully']);
    }
}
