<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function getAttendanceRecords()
    {
        try {
            Log::info('Fetching attendance records directly from the attendance table');

            $attendanceRecords = DB::table('attendances')
                ->join('users', 'attendances.user_id', '=', 'users.user_id')
                ->select(
                    'attendances.id',
                    'users.user_id',
                    'users.name',
                    'attendances.date',
                    'attendances.time_in',
                    'attendances.time_out',
                    'attendances.status',
                    'attendances.accumulated_work_time'
                )
                ->orderBy('attendances.date', 'desc')
                ->get();

            // If accumulated_work_time is not calculated in the database, calculate it here
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
                }
                return $record;
            });

            Log::info('Successfully fetched attendance records', ['count' => $attendanceRecords->count()]);
            return response()->json($attendanceRecords);
        } catch (\Exception $e) {
            Log::error('Error fetching attendance records: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Internal Server Error. Please check the logs for details.',
            ], 500);
        }
    }

    public function getMonthlyAttendanceRecords(Request $request)
    {
        $month = $request->input('month', date('m')); // Default to current month
        $year = $request->input('year', date('Y'));   // Default to current year

        try {
            $attendanceRecords = DB::table('attendances')
                ->join('users', 'attendances.user_id', '=', 'users.user_id')
                ->select(
                    'users.user_id',
                    'users.name',
                    DB::raw('SUM(attendances.accumulated_work_time) AS total_minutes'),
                    DB::raw('AVG(TIME_TO_SEC(attendances.time_in)) AS avg_time_in_seconds'),
                    DB::raw('AVG(TIME_TO_SEC(attendances.time_out)) AS avg_time_out_seconds'),
                    DB::raw('AVG(TIMESTAMPDIFF(MINUTE, attendances.time_in, attendances.time_out)) AS avg_daily_minutes')
                )
                ->whereYear('attendances.date', $year)
                ->whereMonth('attendances.date', $month)
                ->groupBy('users.user_id', 'users.name')
                ->get();

            // Convert values to more readable formats
            $attendanceRecords->transform(function ($record) {
                // Total accumulated hours
                $hours = floor($record->total_minutes / 60);
                $minutes = $record->total_minutes % 60;
                $record->total_hours = $hours . ' hours ' . $minutes . ' minutes';

                // Average time in (convert seconds to HH:MM format)
                $avgTimeIn = gmdate("H:i", $record->avg_time_in_seconds);
                $record->avg_time_in = $avgTimeIn;

                // Average time out (convert seconds to HH:MM format)
                $avgTimeOut = gmdate("H:i", $record->avg_time_out_seconds);
                $record->avg_time_out = $avgTimeOut;

                // Average daily work hours
                $avgHours = floor($record->avg_daily_minutes / 60);
                $avgMinutes = $record->avg_daily_minutes % 60;
                $record->avg_hours = $avgHours . ' hours ' . $avgMinutes . ' minutes';

                return $record;
            });

            return response()->json($attendanceRecords);
        } catch (\Exception $e) {
            Log::error('Error fetching monthly attendance records: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Internal Server Error. Please check the logs for details.',
            ], 500);
        }
    }

    public function archiveDailyAttendance()
    {
        $today = Carbon::now()->toDateString();

        try {
            // Fetch today's attendance records from 'test' table
            $attendanceRecords = DB::table('attendances')
                ->whereDate('date', $today)
                ->get();

            // Insert records into 'attendance_history' table
            foreach ($attendanceRecords as $record) {
                DB::table('attendance_history')->insert([
                    'rfid' => $record->rfid,
                    'user_id' => $record->user_id,
                    'name' => $record->name,
                    'date' => $record->date,
                    'time_in' => $record->time_in,
                    'time_out' => $record->time_out,
                    'created_at' => $record->created_at,
                    'updated_at' => $record->updated_at,
                ]);
            }

            // Delete the records from 'test' table after moving them
            DB::table('attendances')
                ->whereDate('date', $today)
                ->delete();

            return response()->json(['message' => 'Attendance records archived successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while archiving attendance records.'], 500);
        }
    }
}
