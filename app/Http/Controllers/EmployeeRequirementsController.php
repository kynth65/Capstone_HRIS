<?php

namespace App\Http\Controllers;

use App\Models\Requirement;
use App\Models\EmployeeDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmployeeRequirementsController extends Controller
{
    public function getMyRequirements(Request $request)
    {
        try {
            $userId = $request->user()->user_id;

            Log::info('Fetching requirements for user', ['user_id' => $userId]);

            // Get both user-specific and general requirements
            $requirements = Requirement::where('is_active', true)
                ->where(function ($query) use ($userId) {
                    $query->where('user_id', $userId)
                        ->orWhereNull('user_id');
                })
                ->get();

            // Get all documents submitted by this user
            $submittedDocuments = EmployeeDocument::where('user_id', $userId)->get();

            Log::info('Documents found:', ['count' => $submittedDocuments->count()]);

            // Format requirements with document information
            $formattedRequirements = $requirements->map(function ($requirement) use ($submittedDocuments) {
                // Find submitted document for this requirement
                $document = $submittedDocuments->firstWhere('requirement_id', $requirement->id);

                Log::info('Processing requirement', [
                    'requirement_id' => $requirement->id,
                    'has_document' => !is_null($document)
                ]);

                return [
                    'id' => $requirement->id,
                    'name' => $requirement->name,
                    'category' => $requirement->category,
                    'type' => $requirement->type,
                    'is_required' => $requirement->is_required,
                    'is_submitted' => !is_null($document),
                    'is_checked' => $document ? $document->is_checked : false,
                    'document' => $document ? [
                        'id' => $document->id,
                        'certificate_name' => $document->certificate_name,
                        'certificate_file_path' => $document->certificate_file_path,
                        'issued_date' => $document->issued_date,
                        'expiring_date' => $document->expiring_date,
                        'type' => $document->type,
                        'category' => $document->category,
                        'is_checked' => $document->is_checked,
                        'requirement_id' => $document->requirement_id,
                        'remarks' => $document->remarks
                    ] : null,
                    'is_personal' => !is_null($requirement->user_id),
                    'created_at' => $requirement->created_at,
                    'updated_at' => $requirement->updated_at
                ];
            });

            $formattedRequirements = $formattedRequirements->map(function ($requirement) {
                Log::info('Formatted requirement', [
                    'id' => $requirement['id'],
                    'has_document' => isset($requirement['document']),
                    'document_data' => $requirement['document']
                ]);
                return $requirement;
            });

            return response()->json([
                'success' => true,
                'data' => $formattedRequirements,
                'debug_info' => [
                    'user_id' => $userId,
                    'total_requirements' => $requirements->count(),
                    'total_documents' => $submittedDocuments->count(),
                    'requirements_with_docs' => $formattedRequirements->filter(function ($req) {
                        return !is_null($req['document']);
                    })->count()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching employee requirements', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch requirements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getRequirementDetail($requirementId, Request $request)
    {
        try {
            $userId = $request->user()->user_id;

            // Get the requirement
            $requirement = Requirement::where('id', $requirementId)
                ->where(function ($query) use ($userId) {
                    $query->where('user_id', $userId)
                        ->orWhereNull('user_id');
                })
                ->firstOrFail();

            // Get the submitted document if it exists
            $document = EmployeeDocument::where('requirement_id', $requirementId)
                ->where('user_id', $userId)
                ->first();

            if ($document) {
                $document = [
                    'id' => $document->id,
                    'certificate_name' => $document->certificate_name,
                    'certificate_file_path' => $document->certificate_file_path,
                    'issued_date' => $document->issued_date,
                    'expiring_date' => $document->expiring_date,
                    'type' => $document->type,
                    'category' => $document->category,
                    'is_checked' => $document->is_checked,
                    'requirement_id' => $document->requirement_id,
                    'remarks' => $document->remarks
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'requirement' => $requirement,
                    'submitted_document' => $document
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching requirement detail', [
                'requirement_id' => $requirementId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch requirement detail',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
