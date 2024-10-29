<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Certificate;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use Illuminate\Support\Str;


class HRDashboardController extends Controller
{
    public function index()
    {
        try {
            Log::info('Fetching total users count.');
            $totalUsers = DB::table('users')->count();
            Log::info('Total users count fetched successfully.', ['totalUsers' => $totalUsers]);

            $today = Carbon::now()->toDateString();

            Log::info('Fetching present count for today.');

            // Set the timezone to Asia/Manila
            $today = Carbon::now('Asia/Manila')->toDateString();  // Get today’s date in Philippine Time
            $presentCount = DB::table('attendances')
                ->where('status', 'present')
                ->whereDate('date', $today)
                ->count();

            Log::info('Present count fetched with Philippine Time:', ['date' => $today, 'count' => $presentCount]);


            Log::info('Fetching leave count.');
            $leaveCount = DB::table('leave_requests')->where('statuses', 'approved')->count();
            Log::info('Leave count fetched successfully.', ['leaveCount' => $leaveCount]);

            // Log::info('Fetching turnover rates.');
            // $turnoverRate = DB::table('turnover_rates')
            //     ->select('name', 'involuntary as Involuntary', 'voluntary as Voluntary')
            //     ->get();
            // Log::info('Turnover rates fetched successfully.', ['turnoverRate' => $turnoverRate]);

            //Log::info('Fetching employment status.');
            //$employmentStatus = DB::table('employment_statuses')
            //    ->select('name', 'full_time as FullTime', 'part_time as PartTime', 'student as Student')
            //    ->get();
            //Log::info('Employment status fetched successfully.', ['employmentStatus' => $employmentStatus]);


            // Hard-coded employment status for testing
            Log::info('Fetching employment status.');
            $employmentStatus = $this->fetchEmploymentStatus();

            $notifications = DB::table('notifications')
                ->select('message', 'created_at')
                ->whereNotNull('message') // Ensure 'message' is not null
                ->where('message', '!=', '') // Ensure 'message' is not an empty string
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get();
            Log::info('Notifications fetched successfully.', ['notifications' => $notifications]);

            Log::info('Fetching leave requests.');


            $data = [
                'total' => $totalUsers,
                'present' => $presentCount,
                'leave' => $leaveCount,
                'employmentStatus' => $employmentStatus,
                'notifications' => $notifications,
            ];

            Log::info('Data prepared for response.', ['data' => $data]);

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('An error occurred while fetching dashboard data.', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'An error occurred while fetching dashboard data.'], 500);
        }
    }

    public function leaveRequest()
    {
        Log::info('Fetching leave requests.');

        $leaveRequests = DB::table('leave_requests')
            ->join('users', 'leave_requests.user_id', '=', 'users.user_id')
            ->select(
                'leave_requests.id',
                'users.name as user_name', // Rename for clarity
                'users.sick_leave_balance',
                'leave_requests.file_name',
                'leave_requests.file_path',
                'leave_requests.statuses', // Match the frontend field name
                'leave_requests.start_date', // Include start date
                'leave_requests.end_date',   // Include end date
                'leave_requests.days_requested', // Include days requested
                'leave_requests.created_at'
            )
            ->get();

        Log::info('Leave requests fetched successfully.', ['leaveRequests' => $leaveRequests]);

        $data = [
            'leaveRequests' => $leaveRequests
        ];

        return response()->json($data);
    }

    public function notifications()
    {
        try {
            Log::info('Fetching notifications.');
            $notifications = DB::table('notifications')
                ->select('message', 'created_at') // Include 'created_at'
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get();

            Log::info('Notifications fetched successfully.', ['notifications' => $notifications]);

            return response()->json($notifications); // Return notifications
        } catch (\Exception $e) {
            Log::error('An error occurred while fetching notifications.', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'An error occurred while fetching notifications.'], 500);
        }
    }

    public function expiringCertificates()
    {
        try {
            Log::info('Fetching expiring and expired certificates.');
            $now = Carbon::now();
            $thirtyDaysFromNow = $now->copy()->addDays(30);

            // Fetch expiring certificates (within the next 30 days)
            $expiringCertificates = Certificate::whereBetween('expiring_date', [$now, $thirtyDaysFromNow])
                ->with('user')
                ->get();

            // Fetch expired certificates (before the current date)
            $expiredCertificates = Certificate::where('expiring_date', '<', $now)
                ->with('user')
                ->get();

            Log::info('Expiring and expired certificates fetched successfully.');

            // Send notifications for expiring certificates
            if ($expiringCertificates->isNotEmpty()) {
                $this->sendExpiringCertificateNotifications($expiringCertificates);
            }

            // Return both expiring and expired certificates
            return response()->json([
                'expiringCertificates' => $expiringCertificates,
                'expiredCertificates' => $expiredCertificates,
            ]);
        } catch (\Exception $e) {
            Log::error('An error occurred while fetching expiring and expired certificates.', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'An error occurred while fetching certificates.'], 500);
        }
    }

    protected function sendExpiringCertificateNotifications($certificates, $isExpired = false)
    {
        foreach ($certificates as $certificate) {
            $userName = $certificate->user ? $certificate->user->name : 'Unknown User';
            $expiringDate = $certificate->expiring_date->format('Y-m-d');
            $message = $isExpired
                ? "Certificate '{$certificate->certificate_name}' for user '{$userName}' has expired."
                : "Certificate '{$certificate->certificate_name}' for user '{$userName}' is expiring on {$expiringDate}.";

            // Check if the notification already exists in the employee_notifications table
            $employeeNotification = DB::table('employee_notifications')
                ->where('user_id', $certificate->user_id)
                ->where('message', $message)
                ->first();

            // Insert into employee_notifications if it doesn't exist
            if (!$employeeNotification) {
                DB::table('employee_notifications')->insert([
                    'id' => Str::uuid(),
                    'user_id' => $certificate->user_id,
                    'message' => $message,
                    'type' => $isExpired ? 'expired' : 'expiring',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                Log::info('Inserted employee notification:', ['user_id' => $certificate->user_id, 'message' => $message]);
            } else {
                Log::info('Employee notification already exists, skipping.', ['message' => $message]);
            }
        }
    }

    private function fetchEmploymentStatus()
    {
        Log::info('Fetching employment status.');

        // Fetch employment status from users table, grouping by employment status
        $employmentStatus = DB::table('users')
            ->select('employment_status', DB::raw('count(*) as total'))
            ->groupBy('employment_status')
            ->get();

        // Prepare data for BarChart
        $formattedStatus = [
            'FullTime' => 0,
            'PartTime' => 0,
            'Contract' => 0,
        ];

        // Populate formattedStatus with actual counts
        foreach ($employmentStatus as $status) {
            switch ($status->employment_status) {
                case 'Full-time':
                    $formattedStatus['FullTime'] = $status->total;
                    break;
                case 'Part-time':
                    $formattedStatus['PartTime'] = $status->total;
                    break;
                case 'Contract':
                    $formattedStatus['Contract'] = $status->total;
                    break;
            }
        }

        Log::info('Employment status fetched successfully.', ['employmentStatus' => $formattedStatus]);

        return $formattedStatus; // Return the associative array
    }


    public function getHighlightedDates()
    {
        // Fetch dates with their recruitment stage and candidate name
        $dates = DB::table('candidates')
            ->whereIn('recruitment_stage', ['Interview', 'Exam', 'Orientation'])
            ->select(
                'date',
                'recruitment_stage',
                'name as candidate_name' // Add candidate name
            )
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'recruitment_stage' => $item->recruitment_stage,
                    'name' => $item->candidate_name
                ];
            });

        return response()->json($dates);
    }


    public function getHighlightedDatesExpiringCertificates()
    {
        try {
            $now = Carbon::now();

            $dates = DB::table('certificates')
                ->join('users', 'certificates.user_id', '=', 'users.user_id')
                ->select(
                    DB::raw('DATE(certificates.expiring_date) as date'),
                    'users.name',  // Get user name
                    'certificates.certificate_name', // Get certificate name
                    DB::raw("CASE 
                    WHEN certificates.expiring_date < CURDATE() THEN 'Expired'
                    WHEN certificates.expiring_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Expiring Soon'
                    ELSE 'Valid'
                END as status")
                )
                ->whereNotNull('certificates.expiring_date')
                ->where('certificates.expiring_date', '!=', 'Non-Expiring')
                ->get()
                ->map(function ($item) {
                    return [
                        'date' => Carbon::parse($item->date)->format('Y-m-d'),
                        'name' => $item->name,
                        'certificate_name' => $item->certificate_name,
                        'status' => $item->status
                    ];
                });

            return response()->json($dates);
        } catch (\Exception $e) {
            Log::error('Error fetching highlighted dates: ' . $e->getMessage());
            return response()->json(['error' => 'Error fetching dates'], 500);
        }
    }

    public function getHighlightedDatesLeave()
    {
        // Fetch dates from leave_requests table with user names
        $dates = DB::table('leave_requests')
            ->join('users', 'leave_requests.user_id', '=', 'users.user_id')
            ->select('leave_requests.start_date', 'users.name') // Select start_date and user name
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->start_date,
                    'name' => $item->name // Now returning name instead of status
                ];
            });

        return response()->json($dates);
    }
}
