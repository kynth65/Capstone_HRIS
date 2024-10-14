<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class callOpenAi extends Controller
{
    public function generateDocument(Request $request)
    {
        try {
            $apiKey = env('OPENAI_API_KEY');
            $documentType = $request->input('documentType');
            $reason = $request->input('reason');

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a helpful assistant that generates formal documents.'
                    ],
                    [
                        'role' => 'user',
                        'content' => "Create a {$documentType} for the following reason: {$reason}"
                    ]
                ],
                'max_tokens' => 500,
                'temperature' => 0.7
            ]);

            // Check if the OpenAI response is successful
            if ($response->failed()) {
                Log::error('OpenAI API request failed', ['response' => $response->body()]);
                return response()->json(['error' => 'Failed to generate document content'], 500);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            // Log the error and return a user-friendly response
            Log::error('Error generating document: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while generating the document. Please try again later.'], 500);
        }
    }
    public function rankResumes(Request $request)
    {
        try {
            $apiKey = env('OPENAI_API_KEY');
            $hrTags = $request->input('hrTags');
            $resumes = $request->input('resumes');

            $rankedResumes = [];
            foreach ($resumes as $resume) {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json',
                ])->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are an assistant that matches resumes with job requirements.'
                        ],
                        [
                            'role' => 'user',
                            'content' => "Job Requirements: {$hrTags}"
                        ],
                        [
                            'role' => 'user',
                            'content' => "Resume Content: {$resume}"
                        ]
                    ],
                    'max_tokens' => 500,
                    'temperature' => 0.7
                ]);

                if ($response->failed()) {
                    Log::error('OpenAI API request failed for resume ranking', ['response' => $response->body()]);
                    continue;
                }

                $rankedResumes[] = $response->json();
            }

            return response()->json(['ranked_resumes' => $rankedResumes]);
        } catch (\Exception $e) {
            Log::error('Error ranking resumes: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while ranking the resumes. Please try again later.'], 500);
        }
    }
}
