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
            $presentCount = DB::connection('mysql_second')
                ->table('test')
                ->whereNotNull('time_in')
                ->count();
            Log::info('Present records for today:', ['presentRecords' => $presentCount]);;

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
                'leave_requests.file_name',
                'leave_requests.file_path',
                'leave_requests.statuses', // Match the frontend field name
                'leave_requests.start_date', // Include start date
                'leave_requests.end_date',   // Include end date
                'leave_requests.days_requested' // Include days requested
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
        // Fetch dates where recruitment stage matches the criteria
        $dates = DB::table('candidates')
            ->whereIn('recruitment_stage', ['Interview', 'Exam', 'Orientation'])
            ->pluck('date'); // Extract only the date column

        return response()->json($dates); // Return the dates as JSON
    }
}
