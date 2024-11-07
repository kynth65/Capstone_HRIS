<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Models\Candidate;
use Carbon\Carbon;


class InterviewController extends Controller
{

    public function interviewPassed($id)
    {
        $candidate = Candidate::findOrFail($id);

        $candidate->recruitment_stage = "Exam";
        $candidate->time = null;
        $candidate->date = null;
        $candidate->save();

        Mail::to($candidate->email)->send(new \App\Mail\InterviewPassedMail($candidate));

        return response()->json(['message' => 'Onboarding email sent successfully']);
    }

    public function interviewDeclined($id)
    {
        $candidate = Candidate::findOrFail($id);

        Mail::to($candidate->email)->send(new \App\Mail\InterviewDeclinedMail($candidate));

        return response()->json(['message' => 'Onboarding email sent successfully']);
    }

    public function finalInterview(Request $request, $id)
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
        $candidate->date = $request->date;
        $candidate->time = $request->time;
        $candidate->save();
        Mail::to($candidate->email)->send(new \App\Mail\FinalInterviewMail($candidate));

        return response()->json(['message' => 'Onboarding email sent successfully']);
    }
}
