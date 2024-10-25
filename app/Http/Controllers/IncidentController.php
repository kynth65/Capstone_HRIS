<?php

namespace App\Http\Controllers;

use App\Models\ComplianceReport;
use App\Models\EmployeeNotification;
use App\Models\Incident;
use App\Models\Notification;
use App\Models\ReportedIncident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;


class IncidentController extends Controller
{

    public function index(Request $request)
    {
        $query = Incident::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $query->withCount(['reportedIncidents as compliance_reports_count' => function ($query) {
            $query->has('complianceReports');
        }]);

        $incidents = $query->get();

        return response()->json($incidents);
    }

    public function show($id)
    {
        $incident = Incident::with(['reportedIncidents.complianceReports.user'])
            ->findOrFail($id);

        if ($incident->file_path) {
            $incident->file_url = asset('storage/' . $incident->file_path);
        }

        // Flatten the compliance reports for easier access
        $complianceReports = $incident->reportedIncidents->flatMap->complianceReports;

        return response()->json([
            'incident' => $incident,
            'complianceReports' => $complianceReports
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'incident_date' => 'required|date',
            'severity' => 'required|string|in:Low,Medium,High',
            'status' => 'required|string|in:Pending,Investigating,Resolved',
            'file_path' => 'nullable|file|mimes:pdf|max:2048',
            'name' => 'required',
            'reported_employee_ids' => 'nullable|json'
        ]);

        $filePath = null;
        if ($request->hasFile('file_path') && $request->file('file_path')->isValid()) {
            $filename = time() . '.' . $request->file('file_path')->getClientOriginalExtension();
            $filePath = $request->file('file_path')->storeAs('incident_reports', $filename, 'public');
        }

        $incident = Incident::create([
            'user_id' => $request->input('user_id'),
            'name' => $request->input("name"),
            'title' => $validatedData['title'],
            'description' => $validatedData['description'],
            'incident_date' => $validatedData['incident_date'],
            'severity' => $validatedData['severity'],
            'status' => $validatedData['status'],
            'file_path' => $filePath,
            'reported_employee_ids' => $validatedData['reported_employee_ids'] ? json_decode($validatedData['reported_employee_ids']) : null,
        ]);

        // Create notification data
        $notificationData = [
            'type' => 'incident_report',
            'data' => [
                'title' => $incident->title,
                'severity' => $incident->severity,
                'incident_id' => $incident->id
            ],
            'notifiable_id' => $request->input('user_id'),  // ID of the user to be notified
            'notifiable_type' => 'App\Models\User',  // Assuming users are the notifiable entities
            'user_id' => $request->input('user_id'),  // User ID who created the incident
            'message' => "New incident report from {$request->input('name')}",
            'isRead' => false,
        ];

        // Store the notification
        Notification::create($notificationData);

        return response()->json($incident, 201);
    }



    public function getEmployeeIncidents($userId)
    {
        // Fetch incidents only for the given user_id
        $incidents = Incident::where('user_id', $userId)->get();

        // Return the incidents in a JSON response
        return response()->json($incidents);
    }

    public function getReportedIncidents(Request $request)
    {
        $userId = $request->user()->user_id;

        $reportedIncidents = ReportedIncident::where(function ($query) use ($userId) {
            $query->where('user_id', $userId)
                ->orWhereRaw("JSON_CONTAINS(reported_employee_ids, ?)", ['"' . $userId . '"']);
        })->get();

        return response()->json($reportedIncidents);
    }

    public function getComplianceReports($incidentId)
    {
        $complianceReports = ComplianceReport::where('incident_id', $incidentId)
            ->with(['user', 'incident']) // Include incident details
            ->get();

        return response()->json($complianceReports);
    }


    public function update(Request $request, $id)
    {
        Log::info("Updating incident with ID: $id");
        $validatedData = $request->validate([
            'status' => 'nullable|string|in:pending,investigating,resolved',
            'file_path' => 'nullable|file|mimes:pdf|max:2048',
        ]);

        $incident = Incident::find($id);
        if (!$incident) {
            Log::warning("Incident not found with ID: $id");
            return response()->json(['error' => 'Incident not found'], 404);
        }

        // Keep track of old status
        $oldStatus = $incident->status;

        // Update status if provided
        if (isset($validatedData['status']) && $validatedData['status'] !== $oldStatus) {
            $incident->status = $validatedData['status'];
            Log::info("Updated incident status to: {$validatedData['status']}");

            // Create notification for the employee who created the incident
            EmployeeNotification::create([
                'id' => Str::uuid(),
                'user_id' => $incident->user_id, // Using the incident creator's user_id
                'type' => 'incident_update',
                'message' => "Your incident report '{$incident->title}' status has been updated to: " .
                    ucfirst($validatedData['status']),
                'data' => json_encode([
                    'incident_id' => $incident->id,
                    'old_status' => $oldStatus,
                    'new_status' => $validatedData['status'],
                    'title' => $incident->title,
                    'incident_date' => $incident->incident_date
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            Log::info("Incident status update notification sent", [
                'employee_id' => $incident->user_id,
                'incident_id' => $incident->id,
                'notification_type' => 'incident_update',
                'status' => $validatedData['status']
            ]);
        }

        // Handle file upload if provided
        if ($request->hasFile('file_path')) {
            // Delete old file if exists
            if ($incident->file_path) {
                Storage::disk('public')->delete($incident->file_path);
                Log::info("Deleted old file at: {$incident->file_path}");
            }
            // Store new file and update path
            $path = $request->file('file_path')->store('incident_reports', 'public');
            $incident->file_path = $path;
            Log::info("New file stored at: $path");
        }

        // Save incident changes
        $incident->save();
        Log::info("Incident saved with updated details.");

        return response()->json([
            'message' => 'Incident updated successfully.',
            'incident' => $incident->fresh()
        ]);
    }

    public function sendComplianceRequest($id)
    {
        // Fetch the incident
        $incident = Incident::findOrFail($id);

        // Check if there are reported employees
        if (empty($incident->reported_employee_ids)) {
            return response()->json(['error' => 'No reported employees for this incident'], 400);
        }

        // Decode `reported_employee_ids` if it's a JSON string
        $reportedEmployeeIds = is_array($incident->reported_employee_ids)
            ? $incident->reported_employee_ids
            : json_decode($incident->reported_employee_ids, true);

        // Ensure decoding was successful and we have a valid array
        if (empty($reportedEmployeeIds) || !is_array($reportedEmployeeIds)) {
            return response()->json(['error' => 'Invalid or malformed reported employee IDs'], 400);
        }

        // Loop through each reported employee and perform actions
        foreach ($reportedEmployeeIds as $employeeId) {
            ReportedIncident::create([
                'incident_id' => $incident->id,
                'user_id' => $employeeId,
                'name' => $incident->name,
                'title' => $incident->title,
                'description' => $incident->description,
                'status' => $incident->status,
                'incident_date' => $incident->incident_date,
                'severity' => $incident->severity,
                'file_path' => $incident->file_path,
                'reported_employee_ids' => $reportedEmployeeIds, // This will be automatically serialized
            ]);

            EmployeeNotification::create([
                'id' => Str::uuid(),
                'user_id' => $employeeId,
                'type' => 'compliance_report', // Added type to match EmployeeLayout
                'message' => 'You are being reported in the incident titled "' . $incident->title . '". Submit a written report within 5 days.',
                'data' => json_encode([
                    'incident_id' => $incident->id,
                    'title' => $incident->title,
                    'severity' => $incident->severity,
                    'incident_date' => $incident->incident_date
                ]), // Added data field for additional context
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Log the success of each operation
            Log::info("Compliance request sent and incident duplicated for employee ID: $employeeId for incident ID: $incident->id");
        }

        // Return a success response
        return response()->json(['message' => 'Compliance request sent and incidents duplicated for all reported employees.']);
    }

    public function submitComplianceReport(Request $request, $reportedIncidentId)
    {
        // Authenticate the user
        if (!$request->user()) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        // Validate the input data
        $validatedData = $request->validate([
            'report' => 'required|string',
            'file_path' => 'nullable|file|mimes:pdf|max:2048',
        ]);

        $userId = $request->user()->user_id;

        // Find the reported incident
        $reportedIncident = ReportedIncident::findOrFail($reportedIncidentId);

        // Check if the user is authorized to submit a compliance report for this incident
        if ($reportedIncident->user_id != $userId && !in_array($userId, json_decode($reportedIncident->reported_employee_ids))) {
            return response()->json(['error' => 'Unauthorized to submit compliance report for this incident'], 403);
        }

        // Create a new entry in the compliance_reports table
        $complianceReport = ComplianceReport::create([
            'reported_incident_id' => $reportedIncidentId,
            'user_id' => $userId,
            'report' => $validatedData['report'],
            'file_path' => $request->hasFile('file_path')
                ? $request->file('file_path')->store('compliance_reports', 'public')
                : null,
        ]);


        // Notification data for compliance report submission
        $notificationData = [
            'type' => 'compliance_report',
            'data' => [
                'report' => $complianceReport->report,
                'reported_incident_id' => $reportedIncident->id,
            ],
            'notifiable_id' => $reportedIncident->user_id, // ID of the user (HR or admin) to be notified
            'notifiable_type' => 'App\Models\User', // Assuming notifications are sent to users
            'user_id' => $userId, // User who submitted the compliance report
            'message' => 'A compliance report has been submitted for incident: ' . $reportedIncident->title,
            'isRead' => false,
        ];

        // Store the notification
        Notification::create($notificationData);

        return response()->json([
            'message' => 'Compliance report submitted successfully.',
            'data' => $complianceReport
        ], 201);
    }

    public function destroy($id, Request $request)
    {
        $incident = Incident::findOrFail($id);

        // Get the delete remarks from the request
        $deleteRemarks = $request->input('delete_remarks');

        // Store file path before deletion
        $filePath = $incident->file_path;

        // Create notification for the employee who reported the incident
        EmployeeNotification::create([
            'id' => Str::uuid(),
            'user_id' => $incident->user_id, // This is the reporter's ID
            'type' => 'incident_deleted',
            'message' => 'Your reported incident titled "' . $incident->title . '" has been deleted. Remarks: ' . $deleteRemarks,
            'data' => json_encode([
                'incident_title' => $incident->title,
                'delete_remarks' => $deleteRemarks,
                'deleted_at' => now()->toDateTimeString(),
                'original_incident_date' => $incident->incident_date,
                'severity' => $incident->severity
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Delete the file if it exists
        if ($filePath) {
            Storage::disk('public')->delete($filePath);
        }

        // Delete the incident
        $incident->delete();

        return response()->json(['message' => 'Incident deleted successfully'], 200);
    }
}
