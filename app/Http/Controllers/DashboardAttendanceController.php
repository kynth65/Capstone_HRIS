<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DashboardAttendanceController extends Controller
{
    // Function to sync attendance records to dashboard_attendances
    public function getDashboardRecords()
    {
        try {
            Log::info('Fetching attendance records directly from the attendance table');
            Log::info('Fetching attendance records directly from the attendance table');


            $attendanceRecords = DB::table('dashboard_attendances')
                ->join('users', 'dashboard_attendances.user_id', '=', 'users.user_id')
                ->select(
                    'dashboard_attendances.id',
                    'dashboard_attendances.id',
                    'users.user_id',
                    'users.name',
                    'users.schedule',
                    'dashboard_attendances.date',
                    'dashboard_attendances.time_in',
                    'dashboard_attendances.time_out',
                    'dashboard_attendances.status',
                    'dashboard_attendances.accumulated_work_time',
                    'dashboard_attendances.late'
                )
                ->orderBy('dashboard_attendances.date', 'desc')
                ->orderBy('dashboard_attendances.date', 'desc')
                ->get();

            Log::info('Raw attendance records:', ['records' => $attendanceRecords->toArray()]);

            // Process each record to calculate accumulated work time and lateness
            $attendanceRecords = $attendanceRecords->map(function ($record) {
                if ($record->time_in && $record->time_out) {
                    $timeIn = Carbon::parse($record->time_in);
                    $timeOut = Carbon::parse($record->time_out);
                    $accumulatedMinutes = $timeIn->diffInMinutes($timeOut);


                    // Calculate and assign accumulated work time
                    $record->accumulated_work_time = ($accumulatedMinutes < 60)
                        ? $accumulatedMinutes . ' minutes'
                        : round($accumulatedMinutes / 60, 2) . ' hours';
                } else {
                    $record->accumulated_work_time = '0 minutes';
                    $record->accumulated_work_time = '0 minutes';
                }

                // Split the schedule to extract start_time and end_time
                $scheduleParts = explode(' - ', $record->schedule);
                if (count($scheduleParts) === 2) {
                    $startTime = Carbon::parse(trim($scheduleParts[0]));
                    $gracePeriod = 15; // 15 minutes grace period
                    $lateTime = $startTime->copy()->addMinutes($gracePeriod);

                    // Check for lateness
                    if ($record->time_in && Carbon::parse($record->time_in)->greaterThan($lateTime)) {
                        $record->late = 'Late';
                        Log::info("User {$record->user_id} is late. Time In: {$record->time_in}, Late Time: {$lateTime}");
                    } else {
                        $record->late = 'On time';
                        Log::info("User {$record->user_id} is on time. Time In: {$record->time_in}, Late Time: {$lateTime}");
                    }

                    // Update the late column in the database
                    DB::table('dashboard_attendances')
                        ->where('id', $record->id)
                        ->update(['late' => $record->late]);

                    Log::info("Record details: User ID: {$record->user_id}, Schedule: {$record->schedule}, Time In: {$record->time_in}, Late Status: {$record->late}");
                } else {
                    Log::warning("Invalid schedule format for user {$record->user_id}: {$record->schedule}");
                }

                return $record;
            });

            Log::info('Successfully fetched attendance records', ['count' => $attendanceRecords->count()]);

            // Log the final JSON response
            $response = response()->json($attendanceRecords);
            Log::info('JSON response:', ['response' => $response->getContent()]);

            return $response;
        } catch (\Exception $e) {
            Log::error('Error fetching attendance records: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Internal Server Error. Please check the logs for details.',
            ], 500);
        }
    }


    // Function to handle real-time updates
    public function handleAttendanceUpdate($userId)
    {
        try {
            $today = Carbon::today()->format('Y-m-d');

            // Get the latest actual attendance record
            $latestAttendance = DB::table('attendances')
                ->where('user_id', $userId)
                ->whereDate('date', $today)
                ->orderBy('id', 'desc')
                ->first();

            if ($latestAttendance) {
                // Update dashboard record
                DB::table('dashboard_attendances')
                    ->updateOrInsert(
                        [
                            'user_id' => $userId,
                            'date' => $today
                        ],
                        [
                            'time_in' => $latestAttendance->time_in,
                            'time_out' => null, // Always null for display
                            'status' => $latestAttendance->status,
                            'late' => $latestAttendance->late,
                            'updated_at' => now()
                        ]
                    );
            }

            return response()->json(['message' => 'Dashboard updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Function to get attendance statistics
    public function getDashboardStats()
    {
        try {
            $today = Carbon::today();

            $stats = [
                'total_present' => DB::table('dashboard_attendances')
                    ->whereDate('date', $today)
                    ->where('status', 'present')
                    ->count(),
                'total_late' => DB::table('dashboard_attendances')
                    ->whereDate('date', $today)
                    ->where('late', 'Late')
                    ->count(),
                'total_employees' => DB::table('users')->count()
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
