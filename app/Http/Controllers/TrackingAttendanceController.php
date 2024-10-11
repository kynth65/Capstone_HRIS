<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TrackingAttendanceController extends Controller
{
    // Method to record attendance (directly from test table)
    public function recordAttendance(Request $request)
    {
        $request->validate([
            'rfid' => 'required|string',
            'date' => 'required|date',
            'time_in' => 'required|date_format:H:i',
        ]);

        // Directly insert or update into the test table in attendance_system
        DB::connection('mysql_second')->table('test')->insert([
            'rfid' => $request->rfid,
            'date' => $request->date,
            'time_in' => $request->time_in,
        ]);

        return response()->json(['message' => 'Attendance recorded successfully'], 201);
    }

    // Method to update time_out and calculate total_hours
    public function updateTimeOut(Request $request, $id)
    {
        $request->validate([
            'time_out' => 'required|date_format:H:i',
        ]);

        $attendance = DB::connection('mysql_second')->table('test')->where('id', $id)->first();

        if ($attendance && $attendance->time_in) {
            $timeIn = Carbon::parse($attendance->time_in);
            $timeOut = Carbon::parse($request->time_out);
            $totalHours = $timeIn->diffInMinutes($timeOut) / 60; // Convert minutes to hours

            DB::connection('mysql_second')->table('test')
                ->where('id', $id)
                ->update([
                    'time_out' => $request->time_out,
                    'total_hours' => $totalHours,
                ]);

            return response()->json(['message' => 'Time-out updated successfully']);
        } else {
            return response()->json(['error' => 'Record not found or time_in is missing'], 404);
        }
    }

    // Method to get the daily average for all employees from test table
    public function getDailyAverage()
    {
        $dailyAverages = DB::connection('mysql_second')
            ->table('test')
            ->join('gammacare_db.users', 'test.rfid', '=', 'users.rfid')
            ->select('users.user_id', 'users.name')
            ->selectRaw('TIME_FORMAT(SEC_TO_TIME(AVG(TIME_TO_SEC(time_in))), "%H:%i:%s") as avg_time_in')
            ->selectRaw('TIME_FORMAT(SEC_TO_TIME(AVG(TIME_TO_SEC(time_out))), "%H:%i:%s") as avg_time_out')
            ->selectRaw('ROUND(AVG(TIME_TO_SEC(time_out) - TIME_TO_SEC(time_in)) / 3600, 2) as avg_hours')
            ->groupBy('users.user_id', 'users.name')
            ->get();

        return response()->json($dailyAverages);
    }

    // Method to get daily averages for a specific employee from test table
    public function getEmployeeDailyAverage($userId)
    {
        $average = DB::connection('mysql_second')
            ->table('test')
            ->join('gammacare_db.users', 'test.rfid', '=', 'users.rfid')
            ->where('users.user_id', $userId)
            ->selectRaw('TIME_FORMAT(SEC_TO_TIME(AVG(TIME_TO_SEC(time_in))), "%H:%i:%s") as avg_time_in')
            ->selectRaw('TIME_FORMAT(SEC_TO_TIME(AVG(TIME_TO_SEC(time_out))), "%H:%i:%s") as avg_time_out')
            ->selectRaw('ROUND(AVG(TIME_TO_SEC(time_out) - TIME_TO_SEC(time_in)) / 3600, 2) as avg_hours')
            ->first();

        return response()->json($average);
    }
}
