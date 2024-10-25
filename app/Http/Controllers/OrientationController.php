<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use Illuminate\Http\Request;
use App\Models\Candidate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;


class OrientationController extends Controller
{
    public function orientation($id)
    {
        try {
            $candidate = Candidate::findOrFail($id);

            // Update candidate stage
            $candidate->recruitment_stage = "Probationary";
            $candidate->save();

            // Send email
            Mail::to($candidate->email)->send(new \App\Mail\OrientationMail($candidate));

            // Create notification for admin
            AdminNotification::create([
                'type' => 'probationary_candidate',
                'message' => "New probationary candidate: {$candidate->name} is waiting for account creation.",
                'isRead' => false,
                'data' => json_encode([
                    'candidate_id' => $candidate->id,
                    'candidate_name' => $candidate->name,
                    'candidate_email' => $candidate->email,
                    'type' => 'probationary_candidate'
                ])
            ]);

            return response()->json([
                'message' => 'Onboarding email sent successfully and admin notified'
            ]);
        } catch (\Exception $e) {
            Log::error('Error in orientation process', [
                'candidate_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to process orientation'
            ], 500);
        }
    }
}
