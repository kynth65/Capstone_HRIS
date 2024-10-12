<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log; // Import the Log facade
use Illuminate\Support\Str;

class CandidateController extends Controller
{
    public function triggerOnboarding($candidateId)
    {
        $candidate = Candidate::findOrFail($candidateId);
        $token = Str::random(60);
        $candidate->onboarding_token = $token;
        $candidate->onboarding_status = 'started';
        $candidate->save();

        // Log the onboarding process
        Log::info("Onboarding triggered for candidate: {$candidate->id}, email sent to: {$candidate->email}");

        Mail::to($candidate->email)->send(new \App\Mail\OnboardingMail($candidate));

        return response()->json(['message' => 'Onboarding email sent successfully']);
    }

    public function getCandidate()
    {
        return response()->json(Candidate::all());
    }


    public function store(Request $request)
    {
        // Log the request method and URL
        Log::info('Request method: ' . $request->method());
        Log::info('Request URL: ' . $request->url());

        // Log incoming request data
        Log::info('Incoming request data:', $request->all());

        // Validate request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'hr_name' => 'required',
            'position' => 'required',

            'time' => 'required',
            'date' => 'required|date',
            'job_position' => 'required|string|max:255',
        ]);

        // Proceed with creating the candidate
        $candidate = new Candidate();
        $candidate->name = $validatedData['name'];
        $candidate->hr_name = $validatedData['hr_name'];
        $candidate->position = $validatedData['position'];

        $candidate->email = $validatedData['email'];
        $candidate->date = $validatedData['date'];
        $candidate->time = $validatedData['time'];

        $candidate->job_position = $validatedData['job_position'];
        $candidate->save();

        // Log candidate creation
        Log::info("Candidate created: {$candidate->id}, name: {$candidate->name}");

        return response()->json(['message' => 'Candidate created successfully']);
    }


    public function authenticateCandidate($token)
    {
        // Find the candidate with the onboarding token
        $candidate = Candidate::where('onboarding_token', $token)->firstOrFail();

        // Log the authentication attempt
        Log::info("Candidate authenticated for onboarding: {$candidate->id}");

        // Return the token directly
        return response()->json([
            'token' => $token,
            'name' => $candidate->name,
            'id' => $candidate->id
        ]);
    }
    public function getHrRole()
    {
        $user = User::where("position", "HR Manager")->first();

        return response()->json($user);
    }


    public function storePersonalDetails(Request $request, $id)
    {
        $candidate = Candidate::findOrFail($id);
        $candidate->update($request->only(['personal_details']));
        $candidate->recruitment_stage = 'Interview';
        $candidate->save();
        // Log the personal details update
        Log::info("Personal details updated for candidate: {$candidate->id}, next stage is Interview");

        return response()->json(['message' => 'Personal details updated, next stage is Interview']);
    }

    public function handleResponse(Request $request)
    {
        $token = $request->input('token');
        $response = $request->input('response');

        // Verify the token and find the candidate
        $candidate = Candidate::where('onboarding_token', $token)->firstOrFail();

        // Perform the necessary action based on the response
        if ($response === 'accept') {
            // Handle accept logic
            $candidate->recruitment_stage = "Interview";
            $candidate->save();
            // Redirect to a thank you page
            return redirect()->route('thank.you.page');
        } elseif ($response === 'decline') {
            // Handle decline logic
            $candidate->update([

                'recruitment_stage' => 'Application'  // Keep recruitment stage as 'Application' if declined
            ]);
        }
    }
}
