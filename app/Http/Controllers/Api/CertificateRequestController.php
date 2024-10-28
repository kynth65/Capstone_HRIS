<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\Request;
use App\Models\CertificateRequest;
use App\Models\EmployeeNotification;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CertificateRequestController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'certificate_name' => 'required|string',
            'type' => 'required|in:expirable,non-expirable',
            'category' => 'required|string',
            'issued_date' => 'required|date',
            'expiring_date' => 'required_if:type,expirable|nullable|date|after:issued_date',
            'certificate_file' => 'required|file|mimes:pdf|max:2048',
        ]);

        // Store the uploaded certificate file
        $filePath = $request->file('certificate_file')->store('certificate_requests', 'public');

        // Create the certificate request record
        $certificateRequest = CertificateRequest::create([
            'user_id' => Auth::id(),
            'certificate_name' => $request->certificate_name,
            'type' => $request->type,
            'category' => $request->category,
            'issued_date' => $request->issued_date,
            'expiring_date' => $request->expiring_date,
            'certificate_file_path' => $filePath,
        ]);

        // Get the authenticated user to use their name
        $user = Auth::user();

        // Create a notification for HR regarding the certificate request
        Notification::create([
            'type' => 'new_certificate_request',
            'notifiable_id' => $certificateRequest->id, // Associate with the certificate request
            'notifiable_type' => CertificateRequest::class, // Assuming this is related to the CertificateRequest model
            'user_id' => null, // Can be null if not specific to a user
            'message' => "New certificate request from {$user->name}", // Use the authenticated user's name
            'data' => json_encode([
                'certificate_name' => $request->certificate_name,
                'issued_date' => $request->issued_date,
                'expiring_date' => $request->expiring_date,
                'certificate_file' => $filePath, // Path to the uploaded file
                'requester_name' => $user->name, // Name of the person making the request
                'certificate_request_id' => $certificateRequest->id, // ID of the certificate request
            ]),
            'isRead' => false, // Mark notification as unread by default
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Document request submitted successfully', 'request' => $certificateRequest], 201);
    }

    public function index()
    {
        // Fetch only pending certificate requests with related user data
        $requests = CertificateRequest::where('status', 'pending')
            ->with('user')
            ->get();

        // Optionally map to include the employee name directly
        $requests = $requests->map(function ($request) {
            $request->employee_name = $request->user ? $request->user->name : '';
            return $request;
        });

        return response()->json($requests);
    }


    //fetch the data only for specific employee. 
    public function getUserRequests()
    {
        $userId = Auth::id();
        $requests = CertificateRequest::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($requests);
    }

    public function approve($id)
    {
        $request = CertificateRequest::findOrFail($id);

        // Create a new Certificate based on the approved request
        $certificate = Certificate::create([
            'user_id' => $request->user_id,
            'certificate_name' => $request->certificate_name,
            'issued_date' => $request->issued_date,
            'expiring_date' => $request->expiring_date,
            'certificate_file_path' => $request->certificate_file_path,
            'status' => 'Active',
            'type' => $request->type,
            'category' => $request->category,
            'is_archived' => false,
            'can_update' => false,
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);

        // Update the request status
        $request->status = 'approved';
        $request->save();

        // Create notification for the employee
        EmployeeNotification::create([
            'id' => Str::uuid(),
            'user_id' => $request->user_id,
            'type' => 'certificate_response',
            'message' => "Your certificate request for '{$request->certificate_name}' has been approved.",
            'data' => json_encode([
                'certificate_id' => $certificate->id,
                'certificate_name' => $request->certificate_name,
                'type' => $request->type,
                'category' => $request->category,
                'issued_date' => $request->issued_date,
                'expiring_date' => $request->expiring_date
            ]),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        Log::info("Certificate approval notification sent", [
            'employee_id' => $request->user_id,
            'certificate_id' => $certificate->id,
            'notification_type' => 'certificate_response'
        ]);

        return response()->json([
            'message' => 'Certificate request approved and certificate created',
            'certificate' => $certificate
        ]);
    }

    public function reject(Request $request, $id)
    {
        $certificateRequest = CertificateRequest::findOrFail($id);
        $certificateRequest->status = 'rejected';
        $certificateRequest->remarks = $request->remarks;
        $certificateRequest->save();

        // Create notification for the employee
        EmployeeNotification::create([
            'id' => Str::uuid(),
            'user_id' => $certificateRequest->user_id,
            'type' => 'certificate_response',
            'message' => "Your certificate request for '{$certificateRequest->certificate_name}' has been rejected." .
                ($request->remarks ? " Reason: " . $request->remarks : ""),
            'data' => json_encode([
                'certificate_request_id' => $certificateRequest->id,
                'certificate_name' => $certificateRequest->certificate_name,
                'type' => $certificateRequest->type,
                'category' => $certificateRequest->category,
                'status' => 'rejected',
                'remarks' => $request->remarks,
                'issued_date' => $certificateRequest->issued_date,
                'expiring_date' => $certificateRequest->expiring_date
            ]),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        Log::info("Certificate rejection notification sent", [
            'employee_id' => $certificateRequest->user_id,
            'certificate_request_id' => $certificateRequest->id,
            'notification_type' => 'certificate_response'
        ]);

        return response()->json(['message' => 'Certificate request rejected']);
    }
}
