<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\ArchivedCertificate;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Notifications\CertificateUpdateAccessGranted;
use App\Notifications\CertificateUpdateRequestStatus;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;


class CertificateController extends Controller
{
    // Fetch certificates for a specific user (non-archived)
    public function index($userId)
    {
        $certificates = Certificate::where('user_id', $userId)
            ->where('is_archived', false) // Exclude archived certificates
            ->get();

        foreach ($certificates as $cert) {
            if ($cert->certificate_file_path) {
                $cert->file_url = asset('storage/' . $cert->certificate_file_path);
            }
        }

        return response()->json($certificates);
    }

    public function allCertificates()
    {
        $certificates = Certificate::where('is_archived', false)
            ->with(['user', 'creator', 'updater'])
            ->get();

        foreach ($certificates as $cert) {
            if ($cert->certificate_file_path) {
                $cert->file_url = asset('storage/' . $cert->certificate_file_path);
            }
            $cert->employee_name = $cert->user->name ?? 'Unknown';
            $cert->created_by_name = $cert->creator->name ?? 'Unknown';
            $cert->updated_by_name = $cert->updater->name ?? 'Not yet updated';

            // Determine certificate status
            if ($cert->type === 'non-expirable') {
                $cert->status = 'Active';
            } else {
                $expirationDate = new \DateTime($cert->expiring_date);
                $currentDate = new \DateTime();
                $interval = $currentDate->diff($expirationDate)->days;

                if ($interval < 0) {
                    $cert->status = 'Expired';
                } elseif ($interval <= 30) {
                    $cert->status = 'Expiring';
                } else {
                    $cert->status = 'Active';
                }
            }
        }

        return response()->json($certificates);
    }

    // Store a new certificate
    // Store a new certificate
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'user_id' => 'required|string',
            'certificate_name' => 'required|string|max:255',
            'type' => 'required|string',
            'category' => 'required|string|max:255',
            'certificate_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('certificate_file')) {
            $filename = time() . '.' . $request->file('certificate_file')->getClientOriginalExtension();
            $request->file('certificate_file')->storeAs('certificates', $filename, 'public');
            $validatedData['certificate_file_path'] = 'certificates/' . $filename;
        }

        if ($request->type === 'expirable') {
            $request->validate([
                'issued_date' => 'required|date',
                'expiring_date' => 'required|date|after_or_equal:issued_date',
            ]);
            $validatedData['issued_date'] = $request->issued_date;
            $validatedData['expiring_date'] = $request->expiring_date;
        } else {
            $validatedData['issued_date'] = now();
            $validatedData['expiring_date'] = null;
        }

        // Set the created_by field to the ID of the authenticated user
        $validatedData['created_by'] = Auth::id();

        $certificate = Certificate::create($validatedData);


        return response()->json($certificate, 201);
    }

    // Download a certificate file
    public function download($id)
    {
        $certificate = Certificate::find($id);

        if (!$certificate) {
            return response()->json(['message' => 'Certificate not found'], 404);
        }

        $filePath = storage_path('app/public/' . $certificate->certificate_file_path);

        if (!file_exists($filePath)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return response()->download($filePath, $certificate->certificate_name . '.pdf');
    }

    public function update(Request $request, $id)
    {
        $certificate = Certificate::findOrFail($id);

        $validatedData = $request->validate([
            'certificate_name' => 'required|string|max:255',
            'type' => 'required|string',
            'issued_date' => 'nullable|date',
            'expiring_date' => 'nullable|date|after_or_equal:issued_date',
            'certificate_file' => 'nullable|file|mimes:pdf|max:2048',
        ]);

        $certificate->certificate_name = $validatedData['certificate_name'];
        $certificate->type = $validatedData['type'];
        $certificate->issued_date = $validatedData['issued_date'];

        // Set expiring_date to null if type is non-expirable, otherwise update it
        $certificate->expiring_date = ($validatedData['type'] === 'non-expirable') ? null : $validatedData['expiring_date'];

        if ($request->hasFile('certificate_file')) {
            if ($certificate->certificate_file_path) {
                Storage::disk('public')->delete($certificate->certificate_file_path);
            }
            $filename = time() . '.' . $request->file('certificate_file')->getClientOriginalExtension();
            $path = $request->file('certificate_file')->storeAs('certificates', $filename, 'public');
            $certificate->certificate_file_path = $path;
        }

        $certificate->updated_by = Auth::id();
        $certificate->can_update = false;
        $certificate->save();

        return response()->json($certificate);
    }

    // Fetch certificates by category for a specific user
    public function getCertificatesByCategory($userId, $category)
    {
        $certificates = Certificate::where('user_id', $userId)
            ->where('category', $category)
            ->get();

        foreach ($certificates as $cert) {
            if ($cert->certificate_file_path) {
                $cert->file_url = asset('storage/' . $cert->certificate_file_path);
            }
        }

        return response()->json($certificates);
    }



    public function archiveCertificate($id)
    {
        try {
            $certificate = Certificate::findOrFail($id);

            ArchivedCertificate::create([
                'user_id' => $certificate->user_id,
                'certificate_name' => $certificate->certificate_name,
                'issued_date' => $certificate->issued_date,
                'expiring_date' => $certificate->expiring_date,
                'certificate_file_path' => $certificate->certificate_file_path,
                'status' => $certificate->status,
                'type' => $certificate->type,
                'category' => $certificate->category,
                'created_by' => $certificate->created_by,
                'updated_by' => $certificate->updated_by,
                'is_archived' => true,
            ]);

            $certificate->delete();

            return response()->json(['message' => 'Certificate archived successfully.']);
        } catch (\Exception $e) {
            Log::error('Error archiving certificate:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error archiving certificate'], 500);
        }
    }


    // Delete a certificate
    public function destroy($id)
    {
        $certificate = Certificate::find($id);

        if (!$certificate) {
            return response()->json(['message' => 'Certificate not found'], 404);
        }

        $certificate->delete();

        return response()->json(['message' => 'Certificate deleted successfully'], 200);
    }

    public function grantAccessToCertificate($certificateId, Request $request)
    {
        $certificate = Certificate::findOrFail($certificateId);
        $certificate->can_update = true;
        $certificate->save();

        // Find the employee
        $employee = User::findOrFail($certificate->user_id);

        // Send a Laravel notification
        $employee->notify(new CertificateUpdateAccessGranted($certificate));

        $message = "You have been granted access to update the certificate: '{$certificate->certificate_name}'.";

        // Store notification only in the employee's notifications table
        DB::table('employee_notifications')->insert([
            'id' => Str::uuid(),
            'user_id' => $employee->user_id,
            'message' => $message,
            'type' => 'certificate_update_access',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Update access granted for certificate and notification sent.']);
    }


    public function getMyCertificates()
    {
        $userId = Auth::id(); // Get the authenticated user's ID

        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $certificates = Certificate::where('user_id', $userId)
            ->where('is_archived', false) // Exclude archived certificates
            ->get();

        foreach ($certificates as $cert) {
            if ($cert->certificate_file_path) {
                $cert->file_url = asset('storage/' . $cert->certificate_file_path);
            }
        }

        return response()->json($certificates);
    }

    public function createUpdateRequest(Request $request)
    {
        // Validate the incoming data
        $validatedData = $request->validate([
            'certificate_id' => 'required|exists:certificates,id',
        ]);

        // Get the authenticated user's ID
        $userId = Auth::id();

        // Check if the user is authenticated
        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Check for existing pending requests
        $existingRequest = DB::table('certificate_update_requests')
            ->where('user_id', $userId)
            ->where('certificate_id', $request->certificate_id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json(['message' => 'You already have a pending update request for this certificate.'], 400);
        }

        // Insert a new update request
        DB::table('certificate_update_requests')->insert([
            'user_id' => $userId,
            'certificate_id' => $validatedData['certificate_id'],
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        return response()->json(['message' => 'Certificate update request submitted successfully.']);
    }

    public function approveUpdateRequest($requestId)
    {
        $updateRequest = DB::table('certificate_update_requests')->find($requestId);

        if (!$updateRequest) {
            return response()->json(['message' => 'Update request not found.'], 404);
        }

        // Approve the update request
        DB::table('certificate_update_requests')
            ->where('id', $requestId)
            ->update(['status' => 'approved', 'reviewed_by' => Auth::id(), 'reviewed_at' => now()]);

        $certificate = Certificate::findOrFail($updateRequest->certificate_id);
        $employee = User::findOrFail($updateRequest->user_id);
        $message = "Your update request for certificate '{$certificate->certificate_name}' has been approved.";

        // Send notification to the employee
        $employee->notify(new CertificateUpdateRequestStatus($certificate, 'approved'));

        // Store notification only in the employee's notifications table
        DB::table('employee_notifications')->insert([
            'id' => Str::uuid(),
            'user_id' => $employee->user_id,
            'message' => $message,
            'type' => 'certificate_update_approval',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Update request approved and notification sent.']);
    }

    public function rejectUpdateRequest($requestId)
    {
        $updateRequest = DB::table('certificate_update_requests')->find($requestId);

        if (!$updateRequest) {
            return response()->json(['message' => 'Update request not found.'], 404);
        }

        // Mark the request as rejected
        DB::table('certificate_update_requests')
            ->where('id', $requestId)
            ->update(['status' => 'rejected', 'reviewed_by' => Auth::id(), 'reviewed_at' => now()]);

        $certificate = Certificate::findOrFail($updateRequest->certificate_id);
        $employee = User::findOrFail($updateRequest->user_id);
        $message = "Your update request for certificate '{$certificate->certificate_name}' has been rejected.";

        // Send notification to the employee
        $employee->notify(new CertificateUpdateRequestStatus($certificate, 'rejected'));

        // Store notification only in the employee's notifications table
        DB::table('employee_notifications')->insert([
            'id' => Str::uuid(),
            'user_id' => $employee->user_id,
            'message' => $message,
            'type' => 'certificate_update_rejection',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $certificate->can_update = false;
        return response()->json(['message' => 'Update request rejected and notification sent.']);
    }
    public function getCertificateUpdateRequests()
    {
        $updateRequests = DB::table('certificate_update_requests')
            ->join('certificates', 'certificate_update_requests.certificate_id', '=', 'certificates.id')
            ->join('users', 'certificate_update_requests.user_id', '=', 'users.user_id')
            ->select(
                'certificate_update_requests.*',
                'users.name as employee_name',
                'certificates.certificate_name',
                'certificates.certificate_file_path'
            )
            ->where('certificate_update_requests.status', 'pending')
            ->get();

        foreach ($updateRequests as $request) {
            $request->file_url = $request->certificate_file_path
                ? asset('storage/' . $request->certificate_file_path)
                : null;
        }

        return response()->json($updateRequests);
    }

    public function revokeAccessToCertificate($certificateId)
    {
        $certificate = Certificate::findOrFail($certificateId);
        $certificate->can_update = false; // Revoke access after update
        $certificate->save();

        return response()->json(['message' => 'Update access revoked for certificate.']);
    }
    public function showCertificate($id)
    {
        $certificate = Certificate::where('id', $id)
            ->with(['user', 'creator', 'updater']) // Load user, creator, and updater relationships
            ->first();

        if ($certificate) {
            $certificate->employee_name = $certificate->user ? $certificate->user->name : 'Unknown';
            $certificate->created_by_name = $certificate->creator ? $certificate->creator->name : 'Unknown';
            $certificate->updated_by_name = $certificate->updater ? $certificate->updater->name : 'Not yet updated';
            $certificate->file_url = asset('storage/' . $certificate->certificate_file_path);

            return response()->json($certificate);
        } else {
            return response()->json(['error' => 'Certificate not found'], 404);
        }
    }
}
