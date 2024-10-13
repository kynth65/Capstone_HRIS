<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Models\Candidate;



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

        // Update candidate's exam schedule
        $candidate->date = $request->date;
        $candidate->time = $request->time;
        $candidate->save();
        Mail::to($candidate->email)->send(new \App\Mail\FinalInterviewMail($candidate));

        return response()->json(['message' => 'Onboarding email sent successfully']);
    }
}
