<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Applicant;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\ResumeRanking;
use App\Models\Position;
use Illuminate\Support\Facades\Http;



class ApplicantController extends Controller
{
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
            ]);

            // Fetch hr_tags from open_positions table
            $position = Position::findOrFail($validatedData['position_id']);
            $hr_tags = $position->hr_tags;

            if ($request->hasFile('files')) {
                $file = $request->file('files');
                $filename = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('resumes', $filename, 'public');
                $validatedData['file_path'] = $filePath;
            }

            // Rank the resume using OpenAI
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

            // Extract percentage, matched words, and comments
            preg_match('/Match Percentage: (\d+)%/', $aiResponse, $percentageMatch);
            $percentage = $percentageMatch[1] ?? 0;

            preg_match('/Matched Words: (.+)/', $aiResponse, $matchedWordsMatch);
            $matchedWords = $matchedWordsMatch[1] ?? '';

            // Extract explanation (everything after "Explanation:")
            preg_match('/Explanation: (.+)/s', $aiResponse, $explanationMatch);
            $comments = $explanationMatch[1] ?? '';
            $comments = trim($comments);

            // Prepend percentage to comments
            $comments = "Match Percentage: {$percentage}%\n\n" . $comments;

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
                'message' => 'Resume uploaded and ranked successfully',
                'resume_ranking_id' => $resumeRanking->id
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error uploading and ranking resume: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to upload and rank resume: ' . $e->getMessage()], 500);
        }
    }

    // Update upload status for an applicant based on Google ID
    public function updateUploadStatus(Request $request)
    {
        $validatedData = $request->validate([
            'google_id' => 'required|string',
            'google_name' => 'required|string',
            'google_email' => 'required|email',
            'has_uploaded' => 'required|boolean',
        ]);

        $applicant = Applicant::updateOrCreate(
            ['google_id' => $validatedData['google_id']],
            [
                'name' => $validatedData['google_name'],
                'email' => $validatedData['google_email'],
                'has_uploaded' => $validatedData['has_uploaded'],
            ]
        );

        return response()->json(['message' => 'Upload status updated successfully']);
    }
}
