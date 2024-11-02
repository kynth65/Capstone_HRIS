<?php

namespace App\Http\Controllers;

use App\Models\EmployeeDocument;
use App\Models\Requirement;
use Illuminate\Http\Request;
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
        // Log the entire request content
        Log::info('Document submission started', [
            'request_all' => $request->all(),
            'has_file' => $request->hasFile('certificate_file_path'),
            'files' => $request->allFiles(),
        ]);

        try {
            $validated = $request->validate([
                'user_id' => 'required',
                'requirement_id' => 'required',
                'certificate_name' => 'required',
                'issued_date' => 'required|date',
                'expiring_date' => 'nullable|date',
                'certificate_file_path' => 'required|file', // Match the database column name
                'type' => 'required',
                'category' => 'required'
            ]);

            // If validation passes, we know we have a file
            $file = $request->file('certificate_file_path');

            // Store in the public disk under documents directory
            $path = $file->store('documents', 'public');

            // Create the document record
            $document = EmployeeDocument::create([
                'user_id' => $request->user_id,
                'requirement_id' => $request->requirement_id,
                'certificate_name' => $request->certificate_name,
                'issued_date' => $request->issued_date,
                'expiring_date' => $request->expiring_date,
                'certificate_file_path' => $path, // This matches your DB column name
                'type' => $request->type,
                'category' => $request->category,
                'is_checked' => true  // Set this to true by default

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
            'user_id' => 'required' // Add this validation

        ]);

        $requirement = Requirement::create($request->all());
        return response()->json($requirement);
    }

    public function removeRequirement($id)
    {
        $requirement = Requirement::findOrFail($id);
        $requirement->is_active = false;
        $requirement->save();

        return response()->json(['message' => 'Requirement removed']);
    }
}
