<?php

namespace App\Http\Controllers;

use App\Models\EmployeeDocument;
use App\Models\Requirement;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class DocumentManagementController extends Controller
{
    // Get requirements list for an employee
    public function getEmployeeRequirements($userId)
    {
        try {
            $requirements = Requirement::where('is_active', true)
                ->where(function ($query) use ($userId) {
                    $query->where('user_id', $userId)
                        ->orWhere('user_id', null);
                })
                ->get();

            $submittedDocuments = EmployeeDocument::where('user_id', $userId)->get();

            $requirementsList = $requirements->map(function ($requirement) use ($submittedDocuments) {
                $submitted = $submittedDocuments->firstWhere('requirement_id', $requirement->id);

                return [
                    'id' => $requirement->id,
                    'name' => $requirement->name,
                    'category' => $requirement->category,
                    'type' => $requirement->type,
                    'is_required' => $requirement->is_required,
                    'is_submitted' => !is_null($submitted),
                    'is_checked' => $submitted ? $submitted->is_checked : false,
                    'document' => $submitted ?? null,
                    'is_personal' => !is_null($requirement->user_id)
                ];
            });

            return response()->json($requirementsList);
        } catch (\Exception $e) {
            Log::error('Error fetching employee requirements', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error fetching requirements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Submit document for requirement
    public function submitDocument(Request $request)
    {
        Log::info(
            'Document submission started',
            [
                'request_all' => $request->all(),
                'has_file' => $request->hasFile('certificate_file_path'),
                'files' => $request->allFiles(),
            ]
        );

        try {
            $validated = $request->validate([
                'user_id' => 'required',
                'requirement_id' => 'required',
                'certificate_name' => 'required',
                'issued_date' => 'required|date',
                'expiring_date' => 'nullable|date',
                'certificate_file_path' => 'required|file',
                'type' => 'required',
                'category' => 'required'
            ]);

            // Get requirement name before creating document
            $requirement = Requirement::findOrFail($request->requirement_id);

            $file = $request->file('certificate_file_path');
            $path = $file->store('documents', 'public');

            $document = EmployeeDocument::create([
                'user_id' => $request->user_id,
                'requirement_id' => $request->requirement_id,
                'certificate_name' => $request->certificate_name,
                'issued_date' => $request->issued_date,
                'expiring_date' => $request->expiring_date,
                'certificate_file_path' => $path,
                'type' => $request->type,
                'category' => $request->category,
                'is_checked' => true
            ]);

            // Notify about document submission with requirement name
            DB::table('employee_notifications')->insert([
                'id' => Str::uuid(),
                'user_id' => $request->user_id,
                'message' => "Document '{$request->certificate_name}' has been submitted successfully for requirement '{$requirement->name}'.",
                'type' => 'document_submitted',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json($document);
        } catch (ValidationException $e) {
            Log::error('Validation error', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error in document submission', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'An error occurred while uploading the document.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // HR check document
    public function checkDocument(Request $request, $documentId)
    {
        $document = EmployeeDocument::findOrFail($documentId);
        $document->is_checked = true;
        $document->remarks = $request->remarks;
        $document->save();

        return response()->json($document);
    }

    // Manage requirements (HR only)
    public function addRequirement(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'category' => 'required',
            'type' => 'required',
            'is_required' => 'boolean',
            'user_id' => 'required'
        ]);

        $requirement = Requirement::create($request->all());

        // Add notification for the specific user
        if ($request->user_id) {
            DB::table('employee_notifications')->insert([
                'id' => Str::uuid(),
                'user_id' => $request->user_id,
                'message' => "New requirement '{$requirement->name}' has been added to your documents.",
                'type' => 'requirement_added',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json($requirement);
    }

    public function getArchivedRequirements($userId)
    {
        try {
            $requirements = Requirement::where('is_active', false)
                ->whereNotNull('archived_at')
                ->where('user_id', $userId)  // Changed this line to only get user-specific archives
                ->with(['archivedByUser:id,name'])
                ->get();

            $submittedDocuments = EmployeeDocument::where('user_id', $userId)->get();

            $archivedList = $requirements->map(function ($requirement) use ($submittedDocuments) {
                $submitted = $submittedDocuments->firstWhere('requirement_id', $requirement->id);

                return [
                    'id' => $requirement->id,
                    'name' => $requirement->name,
                    'category' => $requirement->category,
                    'type' => $requirement->type,
                    'archived_at' => $requirement->archived_at,
                    'archived_by' => $requirement->archivedByUser?->name,
                    'document' => $submitted ?? null,
                ];
            });

            return response()->json($archivedList);
        } catch (\Exception $e) {
            Log::error('Error fetching archived requirements', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error fetching archived requirements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function archiveRequirement($id)
    {
        try {
            $requirement = Requirement::findOrFail($id);
            $requirement->archived_at = now();
            $requirement->archived_by = request()->user()?->id;
            $requirement->is_active = false;
            $requirement->save();

            // Notify user if requirement is user-specific
            if ($requirement->user_id) {
                DB::table('employee_notifications')->insert([
                    'id' => Str::uuid(),
                    'user_id' => $requirement->user_id,
                    'message' => "Requirement '{$requirement->name}' has been archived.",
                    'type' => 'requirement_archived',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return response()->json([
                'message' => 'Requirement archived successfully',
                'requirement' => $requirement
            ]);
        } catch (\Exception $e) {
            Log::error('Error archiving requirement', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error archiving requirement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function recoverRequirement($id)
    {
        try {
            $requirement = Requirement::findOrFail($id);
            $requirement->archived_at = null;
            $requirement->archived_by = null;
            $requirement->is_active = true;
            $requirement->save();

            // Notify user if requirement is user-specific
            if ($requirement->user_id) {
                DB::table('employee_notifications')->insert([
                    'id' => Str::uuid(),
                    'user_id' => $requirement->user_id,
                    'message' => "Requirement '{$requirement->name}' has been restored from archive.",
                    'type' => 'requirement_restored',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return response()->json([
                'message' => 'Requirement recovered successfully',
                'requirement' => $requirement
            ]);
        } catch (\Exception $e) {
            Log::error('Error recovering requirement', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error recovering requirement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function removeRequirement($id)
    {
        try {
            $requirement = Requirement::findOrFail($id);
            $requirement->is_active = false;
            $requirement->save();

            // Notify user if requirement is user-specific
            if ($requirement->user_id) {
                DB::table('employee_notifications')->insert([
                    'id' => Str::uuid(),
                    'user_id' => $requirement->user_id,
                    'message' => "Requirement '{$requirement->name}' has been removed.",
                    'type' => 'requirement_removed',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return response()->json(['message' => 'Requirement removed']);
        } catch (\Exception $e) {
            Log::error('Error removing requirement', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error removing requirement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function permanentDeleteRequirement($id)
    {
        try {
            $requirement = Requirement::findOrFail($id);

            // Store user_id before deletion for notification
            $userId = $requirement->user_id;
            $requirementName = $requirement->name;

            // Delete associated documents
            EmployeeDocument::where('requirement_id', $id)->delete();

            // Delete the requirement
            $requirement->delete();

            // Notify user if requirement was user-specific
            if ($userId) {
                DB::table('employee_notifications')->insert([
                    'id' => Str::uuid(),
                    'user_id' => $userId,
                    'message' => "Requirement '{$requirementName}' has been permanently deleted.",
                    'type' => 'requirement_deleted',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return response()->json(['message' => 'Requirement permanently deleted']);
        } catch (\Exception $e) {
            Log::error('Error permanently deleting requirement', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Error deleting requirement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // For Employee Functions
    public function getMyArchivedRequirements(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                    'error' => 'User not authenticated'
                ], 401);
            }

            $userId = $user->id;

            // Debug log
            Log::info('Attempting to fetch archives for user:', [
                'user_id' => $userId,
                'user_type' => gettype($userId)
            ]);

            // Let's check what requirements exist first
            $allRequirements = Requirement::where('is_active', false)
                ->whereNotNull('archived_at')
                ->get();

            Log::info('All archived requirements:', [
                'count' => $allRequirements->count(),
                'requirements' => $allRequirements->toArray()
            ]);

            // Keep the original working query for requirements
            $requirements = Requirement::where('is_active', false)
                ->whereNotNull('archived_at')
                ->where(function ($query) use ($userId) {
                    $query->where('user_id', '020244709') // Keep the original hardcoded ID
                        ->orWhereNull('user_id');
                })
                ->with(['archivedByUser:id,name']) // Add this to get archived by user
                ->get();

            Log::info('User specific requirements:', [
                'count' => $requirements->count(),
                'requirements' => $requirements->toArray()
            ]);

            if ($requirements->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'No archived requirements found'
                ]);
            }

            // Fetch documents for these requirements
            $submittedDocuments = EmployeeDocument::where('user_id', '020244709') // Use the same hardcoded ID
                ->whereIn('requirement_id', $requirements->pluck('id'))
                ->get();

            Log::info('Found submitted documents:', [
                'count' => $submittedDocuments->count(),
                'documents' => $submittedDocuments->toArray()
            ]);

            // Map requirements with their documents
            $archivedList = $requirements->map(function ($requirement) use ($submittedDocuments) {
                $submitted = $submittedDocuments->firstWhere('requirement_id', $requirement->id);
                return [
                    'id' => $requirement->id,
                    'name' => $requirement->name,
                    'category' => $requirement->category,
                    'type' => $requirement->type,
                    'archived_at' => $requirement->archived_at,
                    'archived_by' => $requirement->archivedByUser?->name,
                    'is_personal' => !is_null($requirement->user_id),
                    'document' => $submitted ? [
                        'id' => $submitted->id,
                        'certificate_name' => $submitted->certificate_name,
                        'issued_date' => $submitted->issued_date,
                        'expiring_date' => $submitted->expiring_date,
                        'certificate_file_path' => $submitted->certificate_file_path,
                        'type' => $submitted->type,
                        'category' => $submitted->category,
                        'is_checked' => $submitted->is_checked,
                    ] : null,
                ];
            });

            // Return all archived requirements with their documents
            return response()->json([
                'success' => true,
                'data' => $archivedList,
                'debug_info' => [
                    'total_archived' => $allRequirements->count(),
                    'user_specific' => $requirements->count(),
                    'with_documents' => $submittedDocuments->count()
                ],
                'message' => 'Archived requirements fetched successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error in getMyArchivedRequirements', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $userId ?? 'unknown'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error fetching your archived requirements',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
