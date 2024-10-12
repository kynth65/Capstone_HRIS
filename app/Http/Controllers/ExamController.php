<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Models\Candidate;


class ExamController extends Controller
{
    public function examMail(Request $request, $id)
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
