<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HRDashboardController;
use App\Http\Controllers\Api\SubmitLeaveRequest;
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
use App\Http\Controllers\TrackingAttendanceController;
use App\Http\Controllers\EmployeeAttendanceController;



Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/logout', [AuthController::class, 'logout']);
    Route::post('/profile-update', [UpdateProfileIcon::class, 'updateProfile'])->name('profile.update');

    Route::get('/onboarding/steps', [OnboardingController::class, 'index']);
    Route::post('/onboarding/complete', [OnboardingController::class, 'complete']);
});
Route::middleware('auth:sanctum')->post('/leave', [SubmitLeaveRequest::class, 'submitLeaveRequest']);
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
Route::get('/applicants/{positionId}', [OpenPositionController::class, 'getApplicants']);
Route::get('/open-files/{filename}', [OpenFileController::class, 'openFile']);
Route::get('/record-attendance', [AttendanceController::class, 'recordAttendance']);
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
Route::post('/certificates/archive/{id}', [CertificateController::class, 'archive']);
Route::post('/certificates/grant-access/{id}', [CertificateController::class, 'grantAccessToCertificate']);
Route::middleware('auth:sanctum')->get('/certificates', [CertificateController::class, 'getMyCertificates']);
Route::middleware('auth:sanctum')->post('/certificate-update-requests', [CertificateController::class, 'createUpdateRequest']);
Route::get('/certificate-update-requests', [CertificateController::class, 'getCertificateUpdateRequests']);
Route::post('/certificate-update-requests/{id}/approve', [CertificateController::class, 'approveUpdateRequest']);
Route::post('/certificate-update-requests/{id}/reject', [CertificateController::class, 'rejectUpdateRequest']);
Route::post('/certificates/revoke-access/{id}', [CertificateController::class, 'revokeAccessToCertificate']);
Route::middleware('auth:sanctum')->get('/employee-notifications', [EmployeeNotificationController::class, 'index']);
Route::get('/certificates/archived', [CertificateController::class, 'getArchivedCertificates']);



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
Route::get('/record-attendance', [AttendanceController::class, 'getAttendanceRecords']);
Route::get('/decline', function () {
    return view('declined_invitation');
})->name('declined.page');
Route::middleware('auth:sanctum')->get('/salary-history', [PayrollController::class, 'salaryHistory']);
Route::get('highlighted-dates', [HRDashboardController::class, 'getHighlightedDates']);

Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

Route::get('/sync-attendance', [AttendanceController::class, 'getAttendanceRecords']);
Route::post('/attendance', [TrackingAttendanceController::class, 'recordAttendance']);
Route::patch('/attendance/{id}', [TrackingAttendanceController::class, 'updateTimeOut']);
Route::get('/attendance/averages', [TrackingAttendanceController::class, 'getDailyAverage']);
Route::get('/attendance/averages/{userId}', [TrackingAttendanceController::class, 'getEmployeeDailyAverage']);
Route::delete('/delete-position/{ranking_id}', [OpenPositionController::class, 'deletePosition']);


Route::get('/employee/attendance/{rfid}', [EmployeeAttendanceController::class, 'getAttendanceRecordsByRFID']);
Route::get('/employee/attendance/average/{rfid}', [EmployeeAttendanceController::class, 'getEmployeeDailyAverage']);



//->middleware('auth:sanctum');