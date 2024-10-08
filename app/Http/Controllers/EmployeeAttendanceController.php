<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class EmployeeAttendanceController extends Controller
{
    /**
     * Fetch attendance records from the secondary database's 'test' table
     * where 'rfid' matches the provided RFID.
     */
    public function getAttendanceRecordsByRFID($rfid)
    {
        try {
            Log::info('Fetching attendance records for specified RFID', ['rfid' => $rfid]);

            // Query the test table in the secondary database
            $attendanceRecords = DB::connection('mysql_second')
                ->table('test')
                ->join('gammacare_db.users', 'test.rfid', '=', 'users.rfid')
                ->where('test.rfid', $rfid)
                ->select(
                    'test.id',
                    'users.user_id',
                    'test.date',
                    'test.time_in',
                    'test.time_out'
                )
                ->orderBy('test.date', 'desc')
                ->get();

            // Calculate accumulated time for each record
            $attendanceRecords = $attendanceRecords->map(function ($record) {
                if ($record->time_in && $record->time_out) {
                    $timeIn = Carbon::parse($record->time_in);
                    $timeOut = Carbon::parse($record->time_out);
                    $accumulatedMinutes = $timeIn->diffInMinutes($timeOut);

                    $record->accumulated_time = ($accumulatedMinutes < 60)
                        ? $accumulatedMinutes . ' minutes'
                        : round($accumulatedMinutes / 60, 2) . ' hours';
                } else {
                    $record->accumulated_time = '0 minutes';
                }
                return $record;
            });

            Log::info('Successfully fetched RFID-specific attendance records', ['count' => $attendanceRecords->count()]);
            return response()->json(['records' => $attendanceRecords]);
        } catch (\Exception $e) {
            Log::error('Error fetching attendance records for specified RFID: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Internal Server Error. Please check the logs for details.',
            ], 500);
        }
    }

    /**
     * Get daily average time in, time out, and hours worked for an employee by RFID.
     */
    public function getEmployeeDailyAverage($rfid)
    {
        try {
            Log::info('Calculating daily average for specified RFID', ['rfid' => $rfid]);

            $average = DB::connection('mysql_second')
                ->table('test')
                ->join('gammacare_db.users', 'test.rfid', '=', 'users.rfid')
                ->where('test.rfid', $rfid)
                ->selectRaw('TIME_FORMAT(SEC_TO_TIME(AVG(TIME_TO_SEC(time_in))), "%H:%i:%s") as avg_time_in')
                ->selectRaw('TIME_FORMAT(SEC_TO_TIME(AVG(TIME_TO_SEC(time_out))), "%H:%i:%s") as avg_time_out')
                ->selectRaw('ROUND(AVG(TIME_TO_SEC(time_out) - TIME_TO_SEC(time_in)) / 3600, 2) as avg_hours')
                ->first();

            Log::info('Successfully calculated daily average for RFID', ['rfid' => $rfid]);
            return response()->json($average);
        } catch (\Exception $e) {
            Log::error('Error calculating daily average for RFID: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Internal Server Error. Please check the logs for details.',
            ], 500);
        }
    }
}
