<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Candidate;
use Illuminate\Support\Facades\Mail;


class OrientationController extends Controller
{
    public function orientation($id)
    {
        $candidate = Candidate::findOrFail($id);

        $candidate->recruitment_stage = "Probationary";
        $candidate->save();
        Mail::to($candidate->email)->send(new \App\Mail\OrientationMail($candidate));

        return response()->json(['message' => 'Onboarding email sent successfully']);
    }
}
