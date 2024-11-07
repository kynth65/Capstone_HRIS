<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HRDashboardController;
use App\Http\Controllers\Api\submitLeaveRequest;
use App\Http\Controllers\Api\UpdateProfileIcon;
use App\Http\Controllers\Api\OpenFileController;
use App\Http\Controllers\ArchiveEmployeeController;
use App\Http\Controllers\OpenPositionController;
use Illuminate\Http\Request;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ResumeController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ApplicantController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\AdminTagsController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\OrientationController;
use App\Http\Controllers\ProbationaryController;
use App\Http\Controllers\Api\EmployeeNotificationController;
use App\Http\Controllers\EmployeeAttendanceController;
use App\Http\Controllers\IncidentController;
use App\Http\Controllers\callOpenAi;
use App\Http\Controllers\RegularEmployeeController;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\CertificateRequestController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AdminNotificationController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\RfidCardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardAttendanceController;
use App\Http\Controllers\DocumentManagementController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\EmployeeRequirementsController;


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/logout', [AuthController::class, 'logout']);
    Route::post('/profile-update', [UpdateProfileIcon::class, 'updateProfile'])->name('profile.update');

    Route::get('/onboarding/steps', [OnboardingController::class, 'index']);
    Route::post('/onboarding/complete', [OnboardingController::class, 'complete']);
});

Route::put('/employees/{userId}/update-personal-info', [UpdateProfileIcon::class, 'updatePersonalInfo']);

Route::post('/complete-info', [AuthController::class, 'completeProfile']);
Route::middleware('auth:sanctum')->post('/leave', [submitLeaveRequest::class, 'submitLeaveRequest']);
Route::post('/refresh', [AuthController::class, 'refresh']);
Route::post('/login', [AuthController::class, 'login'])->name('login');
//Route::match(['get', 'post'],'/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::get('/gettoken', [AuthController::class, 'gettoken'])->name('register.gettoken');
Route::get('/employees', [AuthController::class, 'getEmployees'])->name('employees');
Route::get('/employee-payroll', [AuthController::class, 'Employees']);
Route::get('/dashboard', [HRDashboardController::class, 'index']);
Route::get('/leave-request', [HRDashboardController::class, 'leaveRequest']);
Route::get('/expiring-certificates', [HRDashboardController::class, 'expiringCertificates']);
Route::get('/data', [AuthController::class, 'getData']);
Route::post('/positions', [OpenPositionController::class, 'store']);
Route::get('/open-positions', [OpenPositionController::class, 'index']);
Route::get('/hr-tags/{id}', [OpenPositionController::class, 'getHrTags']);
Route::post('/storeTag', [AdminTagsController::class, 'storeTag']);
Route::post('/deleteTag', [AdminTagsController::class, 'deleteTag']);
Route::post('/storeTag', [AdminTagsController::class, 'storeTag']);
Route::post('/deleteTag', [AdminTagsController::class, 'deleteTag']);
Route::get('/applicants/{positionId}', [OpenPositionController::class, 'getApplicants']);
Route::get('/open-files/{filename}', [OpenFileController::class, 'openFile']);
Route::get('/payroll/generate/{userId}', [PayrollController::class, 'generatePayroll']);
Route::post('/leave-requests/{requestId}/approve', [SubmitLeaveRequest::class, 'approveLeave']);
Route::post('/leave-requests/{requestId}/decline', [SubmitLeaveRequest::class, 'declineLeave']);
Route::middleware('auth:sanctum')->get('/request', [SubmitLeaveRequest::class, 'getLeaveRequests']);
Route::middleware('auth:sanctum')->get('/leave-request-status', [SubmitLeaveRequest::class, 'getLeaveRequestStatus']);
Route::delete('/employees/{id}', [ArchiveEmployeeController::class, 'delete']);
Route::delete('/employees-delete/{id}', [ArchiveEmployeeController::class, 'permanentDelete']);
Route::get('/archived-employees', [ArchiveEmployeeController::class, 'index']);
Route::put('/archived-employees/{id}/restore', [ArchiveEmployeeController::class, 'restore']);
Route::get('/applicants', [ApplicantController::class, 'index']);
Route::post('/onboarding', [OnboardingController::class, 'store']);
Route::put('/positions/{id}', [OpenPositionController::class, 'update']);
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
Route::post('/saveTags', [AdminTagsController::class, 'storeTags']);
Route::get('/tags/{position}', [AdminTagsController::class, 'getTagsByPosition']);
Route::get('/allCertificates', [CertificateController::class, 'allCertificates']);
Route::get('/certificates/{userId}', [CertificateController::class, 'index']);
Route::get('/certificates/download/{id}', [CertificateController::class, 'download']);
Route::get('/certificates/show/{id}', [CertificateController::class, 'showCertificate']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/certificates', [CertificateController::class, 'store']);
    Route::put('/certificates/{id}', [CertificateController::class, 'update']);
});
Route::get('/certificates/{userId}/category/{category}', [CertificateController::class, 'getCertificatesByCategory']);
Route::delete('/certificates/{id}', [CertificateController::class, 'destroy']);
Route::post('/certificates/archive/{id}', [CertificateController::class, 'archiveCertificate']);
Route::post('/certificates/grant-access/{id}', [CertificateController::class, 'grantAccessToCertificate']);
Route::middleware('auth:sanctum')->get('/certificates', [CertificateController::class, 'getMyCertificates']);
Route::middleware('auth:sanctum')->post('/certificate-update-requests', [CertificateController::class, 'createUpdateRequest']);
Route::get('/certificate-update-requests', [CertificateController::class, 'getCertificateUpdateRequests']);
Route::post('/certificate-update-requests/{id}/approve', [CertificateController::class, 'approveUpdateRequest']);
Route::post('/certificate-update-requests/{id}/reject', [CertificateController::class, 'rejectUpdateRequest']);
Route::post('/certificates/revoke-access/{id}', [CertificateController::class, 'revokeAccessToCertificate']);
Route::post('/certificates/{id}/recover', [CertificateController::class, 'recover']);
Route::delete('/certificates/{id}/permanent', [CertificateController::class, 'permanentDelete']);
Route::middleware('api')->group(function () {
    Route::get('/certificates/archived', [CertificateController::class, 'getArchivedCertificates']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/certificate-requests', [CertificateRequestController::class, 'store']);
    Route::get('/certificate-requests', [CertificateRequestController::class, 'index']);
    Route::get('/user-certificate-requests', [CertificateRequestController::class, 'getUserRequests']);
    Route::post('/certificate-requests/{id}/approve', [CertificateRequestController::class, 'approve']);
    Route::post('/certificate-requests/{id}/reject', [CertificateRequestController::class, 'reject']);
});

Route::post('/candidate', [CandidateController::class, 'store']);
Route::post('/candidates', [CandidateController::class, 'getCandidate']);
Route::post('/trigger-onboarding/{id}', [CandidateController::class, 'triggerOnboarding']);
Route::get('/onboarding/auth/{token}', [CandidateController::class, 'authenticateCandidate']);
Route::post('/onboarding/{id}/personal-details', [CandidateController::class, 'storePersonalDetails']);
Route::get('/thank-you', function () {
    return view('thankyou');
})->name('thank.you.page');
Route::post('/schedule', [CandidateController::class, 'schedule']);
Route::post('/interviewStage', [CandidateController::class, 'interviewStage']);
Route::get('/interview/response', [CandidateController::class, 'handleResponse'])->name('interview.response');
Route::post('interview-passed/{id}', [InterviewController::class, 'interviewPassed']);
Route::post('interview-declined/{id}', [InterviewController::class, 'interviewDeclined']);
Route::post('final-interview/{id}', [InterviewController::class, 'finalInterview']);
Route::post('exam/{id}', [ExamController::class, 'examMail']);
Route::post('/exam-passed/{id}', [ExamController::class, 'examPassed']);
Route::post('/exam-failed/{id}', [ExamController::class, 'examFailed']);
Route::post('/orientation/{id}', [OrientationController::class, 'orientation']);
Route::post('/probationary/{id}', [ProbationaryController::class, 'probationary']);
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
Route::post('/onboarding/{ranking_id}', [OnboardingController::class, 'toOnboarding']);
Route::delete('/candidate/{ranking_id}', [OnboardingController::class, 'removeCandidate']);
Route::get('payroll/net-salary/{userId}', [PayrollController::class, 'getNetSalary']);
Route::get('/decline', function () {
    return view('declined_invitation');
})->name('declined.page');
Route::middleware('auth:sanctum')->post('/salary-history', [PayrollController::class, 'salaryHistory']);
Route::get('highlighted-dates-expiring-cerfiticates', [HRDashboardController::class, 'getHighlightedDatesExpiringCertificates']);
Route::get('highlighted-dates', [HRDashboardController::class, 'getHighlightedDates']);
Route::get('/highlighted-dates-leave', [HRDashboardController::class, 'getHighlightedDatesLeave']);
Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

Route::get('/sync-attendance', [AttendanceController::class, 'getAttendanceRecords']);
Route::get('/monthly-attendance', [AttendanceController::class, 'getMonthlyAttendanceRecords']);

Route::get('/monthly-attendance', [AttendanceController::class, 'getMonthlyAttendanceRecords']);

Route::delete('/delete-position/{ranking_id}', [OpenPositionController::class, 'deletePosition']);


Route::get('/employee/attendance/{rfid}', [EmployeeAttendanceController::class, 'getAttendanceRecordsByRFID']);
Route::get('/employee/attendance/average/{rfid}', [EmployeeAttendanceController::class, 'getEmployeeDailyAverage']);
Route::get('/attendance-range', [AttendanceController::class, 'getAttendanceByDateRange']);

Route::get('/preview-monthly-report', [AttendanceController::class, 'previewMonthlyReport']);
Route::get('/generate-monthly-report', [AttendanceController::class, 'downloadAttendanceExcel']);

Route::get('/preview-date-range-report', [AttendanceController::class, 'previewDateRangeReport']);
Route::get('/download-date-range-report', [AttendanceController::class, 'downloadDateRangeExcel']);



Route::prefix('dashboard')->group(function () {
    Route::get('/attendance', [DashboardAttendanceController::class, 'getDashboardRecords']);
    Route::get('/attendance/sync', [DashboardAttendanceController::class, 'syncToDashboard']);
    Route::get('/attendance/stats', [DashboardAttendanceController::class, 'getDashboardStats']);
    Route::post('/attendance/update/{userId}', [DashboardAttendanceController::class, 'handleAttendanceUpdate']);
});


Route::prefix('incidents')->group(function () {
    Route::post('/', [IncidentController::class, 'store']);
    Route::get('/', [IncidentController::class, 'index']);
    Route::get('/{id}', [IncidentController::class, 'show']);
    Route::put('/{id}', [IncidentController::class, 'update']);
    Route::delete('/{id}', [IncidentController::class, 'destroy']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/employee/incidents/{userId}', [IncidentController::class, 'getEmployeeIncidents']);
    Route::get('/incidents/{incidentId}/compliance-reports', [IncidentController::class, 'getComplianceReports']);
    Route::post('/reported-incidents/{reportedIncidentId}/compliance-reports', [IncidentController::class, 'submitComplianceReport']);
    Route::post('/incidents/{id}/send-compliance-request', [IncidentController::class, 'sendComplianceRequest']);
    Route::get('/reported-incidents', [IncidentController::class, 'getReportedIncidents']);
});

//Post OpenAi
Route::post('/generate-document', [callOpenAi::class, 'generateDocument']);

Route::post('/applicants/upload', [ApplicantController::class, 'upload']);
Route::post('/rank-resume', [ApplicantController::class, 'rankResume']);
Route::post('/applicants/upload-and-rank', [ApplicantController::class, 'uploadAndRank']);
Route::post('/applicants/update-upload-status', [ApplicantController::class, 'updateUploadStatus']);

Route::prefix('applicants')->group(function () {
    Route::get('/', [ApplicantController::class, 'index']);
    Route::get('/{id}', [ApplicantController::class, 'show']);
    Route::post('/upload', [ApplicantController::class, 'store']);
    Route::put('/{id}', [ApplicantController::class, 'update']);
    Route::delete('/{id}', [ApplicantController::class, 'destroy']);

    // Routes for upload status
    Route::get('/check-upload-status/{google_id}', [ApplicantController::class, 'checkUploadStatus']);
    Route::post('/update-upload-status', [ApplicantController::class, 'updateUploadStatus']);
});


Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/suggestTag', [AdminTagsController::class, 'suggestTag']);
});
Route::get('/getSuggestedTags', [AdminTagsController::class, 'getSuggestedTags']);
Route::post('/reviewSuggestedTag', [AdminTagsController::class, 'reviewSuggestedTag']);

Route::post('/candidates/{candidateId}/notify-regular', [RegularEmployeeController::class, 'notifyRegularEmployee']);
//->middleware('auth:sanctum');

Route::get('/archived-certificates', function () {
    $certificates = DB::table('archived_certificates')->get();
    return response()->json([
        'count' => $certificates->count(),
        'data' => $certificates
    ]);
});

Route::get('/rejected-certificates', function () {
    $certificates = DB::table('certificate_requests')
        ->join('users', 'certificate_requests.user_id', '=', 'users.user_id')
        ->select(
            'certificate_requests.*',
            'users.name as employee_name',
            'certificate_requests.certificate_name', // Assuming certificate_name is in certificate_requests
            'certificate_requests.issued_date',
            'certificate_requests.certificate_file_path',
            'certificate_requests.remarks' // Fetch remarks from certificate_requests table
        )
        ->where('certificate_requests.status', 'rejected')
        ->get();

    return response()->json([
        'count' => $certificates->count(),
        'data' => $certificates
    ]);
});

//Notifications for Human Resource Manager
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
});

//Notifications for Employee
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/employee-notifications', [EmployeeNotificationController::class, 'index']);
    Route::post('/employee-notifications/{id}/mark-as-read', [EmployeeNotificationController::class, 'markAsRead']);
    Route::get('/employee-notifications/unread-count', [EmployeeNotificationController::class, 'unreadCount']);
});

Route::get('/users', [AuthController::class, 'getUsers']);

//Notifications for Admin
Route::prefix('admin')->group(function () {
    Route::get('/notifications', [AdminNotificationController::class, 'index']);
    Route::patch('/notifications/{id}/mark-as-read', [AdminNotificationController::class, 'markAsRead']);
    Route::get('/notifications/unread-count', [AdminNotificationController::class, 'unreadCount']);
});
Route::get('/get-responses/{applicantId}', [ApplicantController::class, 'getApplicantResponses']);

Route::middleware(['api'])->group(function () {
    Route::get('/rfid-cards', [RfidCardController::class, 'index']);
    Route::get('/rfid-cards/available', [RfidCardController::class, 'getAvailable']);
    Route::get('/rfid-cards/assigned', [RfidCardController::class, 'getAssigned']);
    Route::put('/rfid-cards/{id}/status', [RfidCardController::class, 'updateStatus']);
    Route::post('/rfid-cards/{rfid_uid}/assign', [RfidCardController::class, 'assignCard']);
    Route::put('/rfid-cards/{rfid_uid}/unassign', [RfidCardController::class, 'unassignCard']);
    Route::post('/rfid-cards/{id}/acknowledge', [RfidCardController::class, 'acknowledge']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/events/upcoming', [EventController::class, 'upcoming']);
    Route::apiResource('events', EventController::class);
});

Route::post('/departments', [DepartmentController::class, 'store']);
Route::get('/departments', [DepartmentController::class, 'index']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('chat')->group(function () {
        Route::get('/users', [ChatController::class, 'getUsers']);
        Route::get('/messages/{user}', [ChatController::class, 'getMessages']);
        Route::post('/send', [ChatController::class, 'sendMessage']);
        Route::post('/mark-as-read/{userId}', [ChatController::class, 'markAsRead']);
    });
});
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('todos', TodoController::class);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});


Route::prefix('documents')->group(function () {
    Route::get('requirements/{userId}', [DocumentManagementController::class, 'getEmployeeRequirements']);
    Route::post('submit', [DocumentManagementController::class, 'submitDocument']);
    Route::post('check/{documentId}', [DocumentManagementController::class, 'checkDocument']);

    // HR only routes - add middleware as needed

    Route::post('requirements', [DocumentManagementController::class, 'addRequirement']);

    // Delete
    Route::delete('requirements/{id}', [DocumentManagementController::class, 'removeRequirement']);
    Route::delete('requirements/{id}/permanent', [DocumentManagementController::class, 'permanentDeleteRequirement']);

    // Archive
    Route::post('requirements/{id}/archive', [DocumentManagementController::class, 'archiveRequirement']);
    Route::get('requirements/{userId}/archived', [DocumentManagementController::class, 'getArchivedRequirements']);

    // Recover
    Route::post('requirements/{id}/recover', [DocumentManagementController::class, 'recoverRequirement']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/documents/my-requirements/archived', [DocumentManagementController::class, 'getMyArchivedRequirements']);
});

Route::get('/debug/my-archived-requirements', function (Request $request) {
    $userId = (string) $request->user()->id;

    // Get direct requirements
    $requirements = DB::table('requirements')
        ->where('is_active', false)
        ->whereNotNull('archived_at')
        ->where(function ($query) use ($userId) {
            $query->where('user_id', '=', $userId)
                ->orWhereNull('user_id');
        })
        ->get();

    // Get associated documents
    $documents = DB::table('employee_documents')
        ->where('user_id', $userId)
        ->whereIn('requirement_id', $requirements->pluck('id'))
        ->get();

    return response()->json([
        'user_id' => $userId,
        'requirements' => $requirements,
        'documents' => $documents,
        'requirements_count' => $requirements->count(),
        'documents_count' => $documents->count()
    ]);
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/my-requirements', [EmployeeRequirementsController::class, 'getMyRequirements']);
    Route::get('/my-requirements/{requirementId}', [EmployeeRequirementsController::class, 'getRequirementDetail']);
});
