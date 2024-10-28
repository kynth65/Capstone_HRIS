<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Applicant;
use App\Models\Google;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\ResumeRanking;
use App\Models\Position;
use Illuminate\Support\Facades\Http;



class ApplicantController extends Controller
{
    // Get all applicants
    // Get all applicants
    public function index()
    {
        return response()->json(Applicant::all(), 200);
    }

    // Get a single applicant by ID
    public function show($id)
    {
        $applicant = Applicant::find($id);

        if (!$applicant) {
            return response()->json(['message' => 'Applicant not found'], 404);
        }

        return response()->json($applicant, 200);
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email',
                'job_title' => 'required|string|max:255',
                'department' => 'nullable|string|max:255',
                'location' => 'nullable|string|max:255',
                'classification' => 'nullable|string|max:255',
                'dob' => 'nullable|date',
                'hire_date' => 'nullable|date',
                'files' => 'required|file|mimes:pdf|max:2048',
            ]);

            if ($request->hasFile('files')) {
                $file = $request->file('files');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('resumes', $fileName, 'public');
                $validatedData['resume_path'] = $filePath;
            }

            // Remove fields that are not in the table
            unset($validatedData['files']);

            // Set default values for fields that can't be null
            $validatedData['dob'] = $validatedData['dob'] ?? '1900-01-01'; // Default to a far past date
            $validatedData['hire_date'] = $validatedData['hire_date'] ?? null;
            $validatedData['department'] = $validatedData['department'] ?? 'Not Specified';
            $validatedData['location'] = $validatedData['location'] ?? 'Not Specified';
            $validatedData['classification'] = $validatedData['classification'] ?? 'Not Specified';

            $applicant = Applicant::create($validatedData);


            $notificationData = [
                'type' => 'new_applicant',
                'data' => [
                    'applicant_id' => $applicant->id,
                    'first_name' => $applicant->first_name,
                    'last_name' => $applicant->last_name,
                    'job_title' => $applicant->job_title,
                    'department' => $applicant->department
                ],
                'notifiable_id' => 1, // Assuming admin/HR has user ID 1, adjust as needed
                'notifiable_type' => 'App\Models\User',
                'user_id' => 1, // Recipient user ID (admin/HR)
                'message' => "New applicant {$applicant->first_name} {$applicant->last_name} added for {$applicant->job_title} position",
                'isRead' => false,
            ];

            // Store the notification
            Notification::create($notificationData);

            return response()->json([
                'message' => 'Applicant created successfully',
                'applicant' => $applicant
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating applicant: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create applicant: ' . $e->getMessage()], 500);
        }
    }

    // Update an existing applicant
    public function update(Request $request, $id)
    {
        $applicant = Applicant::find($id);

        if (!$applicant) {
            return response()->json(['message' => 'Applicant not found'], 404);
        }

        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:applicants,email,' . $id,
            'position' => 'nullable|string|max:255',
            'resume' => 'nullable|string',
            'google_id' => 'nullable|string|unique:applicants,google_id,' . $id
        ]);

        $applicant->update($validatedData);

        return response()->json([
            'message' => 'Applicant updated successfully',
            'applicant' => $applicant
        ], 200);
    }

    // Delete an applicant
    public function destroy($id)
    {
        $applicant = Applicant::find($id);

        if (!$applicant) {
            return response()->json(['message' => 'Applicant not found'], 404);
        }

        $applicant->delete();

        return response()->json(['message' => 'Applicant deleted successfully'], 200);
    }

    // Check upload status based on Google ID
    public function checkUploadStatus($google_id)
    {
        $applicant = Applicant::where(
            'google_id',
            $google_id
        )->first();

        if ($applicant) {
            return response()->json(['has_uploaded' => $applicant->has_uploaded]);
        }

        return response()->json(['error' => 'Applicant not found'], 404);
    }

    public function upload(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'files' => 'required|file|mimes:pdf|max:2048',
                'filename' => 'required|string',
                'email' => 'required|email',
                'position_name' => 'required|string',
                'name' => 'required|string',
                'mobileNumber' => 'nullable|string',
                'position_id' => 'required|exists:open_positions,id',
                'question1_response' => 'nullable|string',
                'question2_response' => 'nullable|string',
                'question3_response' => 'nullable|string',
                'question4_response' => 'nullable|string',
                'question5_response' => 'nullable|string',
                'question6_response' => 'nullable|string',
                'question7_response' => 'nullable|string',
                'question8_response' => 'nullable|string',
                'question9_response' => 'nullable|string',
                'question10_response' => 'nullable|string',
            ]);

            if ($request->hasFile('files')) {
                $file = $request->file('files');
                $filename = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('resumes', $filename, 'public');
                $validatedData['file_path'] = $filePath;
            }

            $resumeRanking = ResumeRanking::create($validatedData);

            $notificationData = [
                'type' => 'new_application',
                'data' => [
                    'applicant_name' => $validatedData['name'],
                    'position_name' => $validatedData['position_name'],
                    'position_id' => $validatedData['position_id'],
                    'resume_ranking_id' => $resumeRanking->id
                ],
                'notifiable_id' => 1, // Assuming admin/HR has user ID 1, adjust as needed
                'notifiable_type' => 'App\Models\User',
                'user_id' => 1, // Recipient user ID (admin/HR)
                'message' => "Applicant {$validatedData['name']} applied for the position: {$validatedData['position_name']}",
                'isRead' => false,
            ];

            // Store the notification
            Notification::create($notificationData);

            return response()->json([
                'message' => 'Resume uploaded successfully',
                'resume_ranking_id' => $resumeRanking->id
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error uploading resume: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to upload resume: ' . $e->getMessage()], 500);
        }
    }


    public function uploadAndRank(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'files' => 'required|file|mimes:pdf|max:5120',
                'filename' => 'required|string',
                'email' => 'required|email',
                'position_name' => 'required|string',
                'name' => 'required|string',
                'mobileNumber' => 'nullable|string',
                'position_id' => 'required|exists:open_positions,position_id',
                'question1_response' => 'nullable|string',
                'question2_response' => 'nullable|string',
                'question3_response' => 'nullable|string',
                'question4_response' => 'nullable|string',
                'question5_response' => 'nullable|string',
                'question6_response' => 'nullable|string',
                'question7_response' => 'nullable|string',
                'question8_response' => 'nullable|string',
                'question9_response' => 'nullable|string',
                'question10_response' => 'nullable|string',
                'resume_text' => 'required|string',
                'google_id' => 'required|string',
            ]);

            // First, check if user has already applied for this position
            $existingApplication = ResumeRanking::where('email', $validatedData['email'])
                ->where('position_id', $validatedData['position_id'])
                ->first();

            if ($existingApplication) {
                return response()->json([
                    'error' => 'You have already submitted an application for this position.'
                ], 400);
            }

            // Fetch position and hr_tags
            $position = Position::findOrFail($validatedData['position_id']);
            $hr_tags = $position->hr_tags;

            // Handle file upload
            if ($request->hasFile('files')) {
                $file = $request->file('files');
                $filename = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('resumes', $filename, 'public');
                $validatedData['file_path'] = $filePath;
            }

            // OpenAI API call
            $apiKey = env('OPENAI_API_KEY');
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an assistant that matches resumes with job requirements. Always provide the match percentage at the beginning of your response, followed by matched words, and then your explanation.'
                    ],
                    [
                        'role' => 'user',
                        'content' => "Job Requirements: {$hr_tags}"
                    ],
                    [
                        'role' => 'user',
                        'content' => "Resume Content: {$validatedData['resume_text']}. Compare the resume against the job requirements. Provide a match percentage from 0% to 100%, a list of matched words, and a brief explanation. Format your response as follows:\nMatch Percentage: X%\nMatched Words: [list of words]\nExplanation: [your detailed explanation]"
                    ]
                ],
                'max_tokens' => 500,
                'temperature' => 0.7
            ]);

            if ($response->failed()) {
                Log::error('OpenAI API request failed for resume ranking', ['response' => $response->body()]);
                return response()->json(['error' => 'Failed to rank resume'], 500);
            }

            $aiResponse = $response->json()['choices'][0]['message']['content'];

            // Extract data from AI response
            preg_match('/Match Percentage: (\d+)%/', $aiResponse, $percentageMatch);
            preg_match('/Matched Words: (.+)/', $aiResponse, $matchedWordsMatch);
            preg_match('/Explanation: (.+)/s', $aiResponse, $explanationMatch);

            $percentage = $percentageMatch[1] ?? 0;
            $matchedWords = $matchedWordsMatch[1] ?? '';
            $comments = $explanationMatch[1] ?? '';
            $comments = trim("Match Percentage: {$percentage}%\n\n" . ($comments ?? ''));

            // Create ResumeRanking
            $resumeRanking = ResumeRanking::create([
                'filename' => $validatedData['filename'],
                'file_path' => $validatedData['file_path'],
                'percentage' => $percentage,
                'position_id' => $validatedData['position_id'],
                'score' => $percentage,
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'position_name' => $validatedData['position_name'],
                'matched_words' => $matchedWords,
                'comments' => $comments,
                'mobileNumber' => $validatedData['mobileNumber'],
                'question1_response' => $validatedData['question1_response'],
                'question2_response' => $validatedData['question2_response'],
                'question3_response' => $validatedData['question3_response'],
                'question4_response' => $validatedData['question4_response'],
                'question5_response' => $validatedData['question5_response'],
                'question6_response' => $validatedData['question6_response'],
                'question7_response' => $validatedData['question7_response'],
                'question8_response' => $validatedData['question8_response'],
                'question9_response' => $validatedData['question9_response'],
                'question10_response' => $validatedData['question10_response'],
            ]);

            // Create notification
            Notification::create([
                'type' => 'new_application',
                'data' => [
                    'applicant_name' => $validatedData['name'],
                    'position_name' => $validatedData['position_name'],
                    'position_id' => $validatedData['position_id'],
                    'resume_ranking_id' => $resumeRanking->id
                ],
                'notifiable_id' => 1,
                'notifiable_type' => 'App\Models\User',
                'user_id' => 1,
                'message' => "Applicant {$validatedData['name']} applied for the position: {$validatedData['position_name']}",
                'isRead' => false,
            ]);

            // Update or create Google record
            $google = Google::updateOrCreate(
                ['google_id' => $validatedData['google_id']],
                [
                    'google_name' => $validatedData['name'],
                    'google_email' => $validatedData['email'],
                    'has_uploaded' => true
                ]
            );

            // Force update has_uploaded if it's still false
            if (!$google->has_uploaded) {
                $google->has_uploaded = true;
                $google->save();
            }

            return response()->json([
                'message' => 'Resume uploaded and ranked successfully',
                'resume_ranking_id' => $resumeRanking->id
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error uploading and ranking resume: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to upload and rank resume: ' . $e->getMessage()], 500);
        }
    }
    public function updateHasUploaded(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'google_id' => 'required|string'
            ]);

            $applicant = Google::where('google_id', $validatedData['google_id'])->first();

            if (!$applicant) {
                return response()->json(['error' => 'Applicant not found'], 404);
            }

            $applicant->has_uploaded = true;
            $applicant->save();

            return response()->json([
                'message' => 'Has uploaded status updated successfully',
                'status' => $applicant->has_uploaded
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating has_uploaded status: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update has_uploaded status'], 500);
        }
    }

    public function getApplicantResponses($applicantId)
    {
        try {
            // Find the applicant's resume ranking by applicant ID, with related position
            $resumeRanking = ResumeRanking::with('position')->find($applicantId); // Ensure position is loaded

            if (!$resumeRanking) {
                return response()->json(['error' => 'Applicant not found'], 404);
            }

            // Create an array of all potential questions and responses
            $allQuestions = [
                ['text' => 'Question 1', 'response' => $resumeRanking->question1_response],
                ['text' => 'Question 2', 'response' => $resumeRanking->question2_response],
                ['text' => 'Question 3', 'response' => $resumeRanking->question3_response],
                ['text' => 'Question 4', 'response' => $resumeRanking->question4_response],
                ['text' => 'Question 5', 'response' => $resumeRanking->question5_response],
                ['text' => 'Question 6', 'response' => $resumeRanking->question6_response],
                ['text' => 'Question 7', 'response' => $resumeRanking->question7_response],
                ['text' => 'Question 8', 'response' => $resumeRanking->question8_response],
                ['text' => 'Question 9', 'response' => $resumeRanking->question9_response],
                ['text' => 'Question 10', 'response' => $resumeRanking->question10_response],
            ];

            // Filter out questions that do not have a response
            $filteredQuestions = array_filter($allQuestions, function ($question) {
                return !is_null($question['response']);  // Only include questions with non-null responses
            });

            // Include position_name in the response
            return response()->json([
                'position_name' => $resumeRanking->position->name ?? 'Unknown Position',  // Make sure 'position' exists
                'questions' => array_values($filteredQuestions)
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch responses', 'details' => $e->getMessage()], 500);
        }
    }
}
