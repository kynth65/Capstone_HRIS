<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class callOpenAi extends Controller
{
    private function getOpenAIResponse($endpoint, $payload)
    {
        // Directly fetch the API key from the environment
        $apiKey = env('AI_API_KEY');

        // Debug logging
        Log::info('Full API Key being used:', [
            'key' => $apiKey,  // Temporarily log full key for debugging
            'length' => strlen($apiKey)
        ]);

        if (empty($apiKey)) {
            Log::error('API key is not configured');
            throw new \Exception('API key is not configured');
        }

        try {
            $baseUrl = "https://api.openai.com/v1";

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . trim($apiKey),
                'Content-Type' => 'application/json',
            ])->post("{$baseUrl}/{$endpoint}", $payload);

            Log::debug('API Response', [
                'status' => $response->status(),
                'headers' => $response->headers(),
                'body' => $response->json()
            ]);

            if ($response->failed()) {
                $errorBody = $response->json();
                Log::error('API request failed', [
                    'status' => $response->status(),
                    'error' => $errorBody['error'] ?? 'Unknown error',
                    'raw_response' => $response->body()
                ]);

                throw new \Exception($errorBody['error']['message'] ?? 'Failed to get response from API');
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Error in API request: ' . $e->getMessage(), [
                'endpoint' => $endpoint,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function generateDocument(Request $request)
    {
        // Validate the request
        $request->validate([
            'documentType' => 'required|string',
            'reason' => 'required|string',
            'tone' => 'string|in:formal,informal,casual,professional'
        ]);

        try {
            $documentType = $request->input('documentType');
            $reason = $request->input('reason');
            $tone = $request->input('tone', 'formal');

            $payload = [
                'model' => 'gpt-4',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => "You are a helpful assistant that generates {$tone} documents for employees in the company of gammacare medical services incorporation."
                    ],
                    [
                        'role' => 'user',
                        'content' => "Create a {$documentType} in a {$tone} tone for the following reason: {$reason}."
                    ]
                ],
                'max_tokens' => 500,
                'temperature' => 0.7
            ];

            $response = $this->getOpenAIResponse('chat/completions', $payload);
            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Document generation failed', [
                'error' => $e->getMessage(),
                'documentType' => $documentType ?? null,
                'reason' => $reason ?? null
            ]);

            return response()->json([
                'error' => $e->getMessage(),
                'details' => 'An error occurred while generating the document.'
            ], 500);
        }
    }

    public function rankResumes(Request $request)
    {
        // Validate the request
        $request->validate([
            'hrTags' => 'required|string',
            'resumes' => 'required|array',
            'resumes.*' => 'required|string'
        ]);

        try {
            $hrTags = $request->input('hrTags');
            $resumes = $request->input('resumes');

            $rankedResumes = [];
            foreach ($resumes as $index => $resume) {
                $payload = [
                    'model' => 'gpt-4',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are an assistant that matches resumes with job requirements. Rate matches on a scale of 1-100 and provide specific reasons for the rating.'
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
                ];

                try {
                    $response = $this->getOpenAIResponse('chat/completions', $payload);
                    $rankedResumes[] = [
                        'index' => $index,
                        'resume' => $resume,
                        'analysis' => $response
                    ];
                } catch (\Exception $e) {
                    Log::warning("Failed to analyze resume at index {$index}", [
                        'error' => $e->getMessage()
                    ]);
                    // Continue with next resume instead of failing completely
                    continue;
                }
            }

            if (empty($rankedResumes)) {
                throw new \Exception('Failed to analyze any resumes');
            }

            return response()->json([
                'ranked_resumes' => $rankedResumes,
                'total_processed' => count($rankedResumes),
                'total_submitted' => count($resumes)
            ]);

        } catch (\Exception $e) {
            Log::error('Resume ranking failed', [
                'error' => $e->getMessage(),
                'total_resumes' => count($resumes ?? [])
            ]);

            return response()->json([
                'error' => $e->getMessage(),
                'details' => 'An error occurred while ranking the resumes.'
            ], 500);
        }
    }
}