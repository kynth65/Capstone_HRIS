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
            Log::info('Fetching attendance records directly from the test table');

            $attendanceRecords = DB::connection('mysql_second')
                ->table('test')
                ->join('gammacare_db.users', 'test.rfid', '=', 'users.rfid')
                ->select(
                    'test.id',
                    'users.user_id',
                    'test.name',
                    'test.date',
                    'test.time_in',
                    'test.time_out'
                )
                ->orderBy('test.date', 'desc')
                ->get();

            // Calculate accumulated time for display only
            $attendanceRecords = $attendanceRecords->map(function ($record) {
                if ($record->time_in && $record->time_out) {
                    $timeIn = Carbon::parse($record->time_in);
                    $timeOut = Carbon::parse($record->time_out);
                    $accumulatedMinutes = $timeIn->diffInMinutes($timeOut);

                    // Assign accumulated time with a label
                    $record->accumulated_time = ($accumulatedMinutes < 60)
                        ? $accumulatedMinutes . ' minutes'
                        : round($accumulatedMinutes / 60, 2) . ' hours';
                } else {
                    $record->accumulated_time = '0 minutes';
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
    public function archiveDailyAttendance()
    {
        $today = Carbon::now()->toDateString();

        try {
            // Fetch today's attendance records from 'test' table
            $attendanceRecords = DB::connection('mysql_second')->table('test')
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
            DB::connection('mysql_second')->table('test')
                ->whereDate('date', $today)
                ->delete();

            return response()->json(['message' => 'Attendance records archived successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while archiving attendance records.'], 500);
        }
    }
}
