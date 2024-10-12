<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Candidate;
use Illuminate\Support\Facades\Mail;

class ProbationaryController extends Controller
{
    public function probationary($id)
    {
        $candidate = Candidate::findOrFail($id);

        $candidate->recruitment_stage = "Regular";
        $candidate->save();
        Mail::to($candidate->email)->send(new \App\Mail\ProbationaryMail($candidate));

        return response()->json(['message' => 'Onboarding email sent successfully']);
    }
}
