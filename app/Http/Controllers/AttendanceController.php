<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use Symfony\Component\HttpFoundation\StreamedResponse;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class AttendanceController extends Controller
{
    public function getAttendanceRecords()
    {
        try {
            Log::info('Fetching attendance records directly from the attendance table');
            Log::info('Fetching attendance records directly from the attendance table');


            $attendanceRecords = DB::table('attendances')
                ->join('users', 'attendances.user_id', '=', 'users.user_id')
                ->select(
                    'attendances.id',
                    'attendances.id',
                    'users.user_id',
                    'users.name',
                    'users.schedule',
                    'attendances.date',
                    'attendances.time_in',
                    'attendances.time_out',
                    'attendances.status',
                    'attendances.accumulated_work_time',
                    'attendances.late'
                )
                ->orderBy('attendances.date', 'desc')
                ->orderBy('attendances.date', 'desc')
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
                    DB::table('attendances')
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



    public function getMonthlyAttendanceRecords(Request $request)
    {
        $month = $request->input('month', date('m'));
        $year = $request->input('year', date('Y'));

        try {
            $attendanceRecords = DB::table('attendances')
                ->join('users', 'attendances.user_id', '=', 'users.user_id')
                ->select(
                    'users.user_id',
                    'users.name',
                    DB::raw('SUM(attendances.accumulated_work_time) AS total_minutes'),
                    DB::raw('
                    AVG(
                        TIME_TO_SEC(
                            (SELECT MIN(time_in) 
                             FROM attendances a2 
                             WHERE a2.user_id = attendances.user_id 
                             AND a2.date = attendances.date)
                        )
                    ) AS avg_time_in_seconds
                '),
                    DB::raw('
                    AVG(
                        TIME_TO_SEC(
                            COALESCE(
                                (SELECT MAX(time_out) 
                                 FROM attendances a3 
                                 WHERE a3.user_id = attendances.user_id 
                                 AND a3.date = attendances.date),
                                (SELECT MAX(time_in) 
                                 FROM attendances a4 
                                 WHERE a4.user_id = attendances.user_id 
                                 AND a4.date = attendances.date)
                            )
                        )
                    ) AS avg_time_out_seconds
                '),
                    DB::raw('AVG(TIMESTAMPDIFF(MINUTE, 
                    (SELECT MIN(time_in) FROM attendances a2 WHERE a2.user_id = attendances.user_id AND a2.date = attendances.date),
                    COALESCE(
                        (SELECT MAX(time_out) FROM attendances a3 WHERE a3.user_id = attendances.user_id AND a3.date = attendances.date),
                        (SELECT MAX(time_in) FROM attendances a4 WHERE a4.user_id = attendances.user_id AND a4.date = attendances.date)
                    )
                )) AS avg_daily_minutes')
                )
                ->whereYear('attendances.date', $year)
                ->whereMonth('attendances.date', $month)
                ->groupBy('users.user_id', 'users.name')
                ->get();

            $attendanceRecords->transform(function ($record) {
                $hours = floor($record->total_minutes / 60);
                $minutes = $record->total_minutes % 60;
                $record->total_hours = $hours . ' hours ' . $minutes . ' minutes';

                $record->avg_time_in = gmdate("H:i", $record->avg_time_in_seconds);
                $record->avg_time_out = gmdate("H:i", $record->avg_time_out_seconds);

                $avgHours = floor($record->avg_daily_minutes / 60);
                $avgMinutes = $record->avg_daily_minutes % 60;
                $record->avg_hours = $avgHours . ' hours ' . $avgMinutes . ' minutes';

                return $record;
            });

            return response()->json($attendanceRecords);
        } catch (\Exception $e) {
            Log::error('Error fetching monthly attendance records: ' . $e->getMessage());
            return response()->json([
                'message' => 'Internal Server Error. Please check the logs for details.'
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

    public function getAttendanceByDateRange(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required|string',
                'from_date' => 'required|date',
                'to_date' => 'required|date|after_or_equal:from_date'
            ]);

            $records = DB::table('attendances')
                ->join('users', 'attendances.user_id', '=', 'users.user_id')
                ->where('attendances.user_id', $request->user_id)
                ->whereBetween('attendances.date', [$request->from_date, $request->to_date])
                ->select(
                    'users.name',
                    DB::raw('COUNT(DISTINCT attendances.date) as days_worked'),
                    DB::raw('
                    SUM(
                        TIMESTAMPDIFF(MINUTE,
                            (SELECT MIN(time_in) FROM attendances a2 
                             WHERE a2.user_id = attendances.user_id 
                             AND a2.date = attendances.date),
                            COALESCE(
                                (SELECT MAX(time_out) FROM attendances a3 
                                 WHERE a3.user_id = attendances.user_id 
                                 AND a3.date = attendances.date),
                                (SELECT MAX(time_in) FROM attendances a4 
                                 WHERE a4.user_id = attendances.user_id 
                                 AND a4.date = attendances.date)
                            )
                        )
                    ) as total_minutes
                '),
                    DB::raw('
                    AVG(
                        TIME_TO_SEC(
                            (SELECT MIN(time_in) 
                             FROM attendances a2 
                             WHERE a2.user_id = attendances.user_id 
                             AND a2.date = attendances.date)
                        )
                    ) as avg_time_in_seconds
                '),
                    DB::raw('
                    AVG(
                        TIME_TO_SEC(
                            COALESCE(
                                (SELECT MAX(time_out) 
                                 FROM attendances a3 
                                 WHERE a3.user_id = attendances.user_id 
                                 AND a3.date = attendances.date),
                                (SELECT MAX(time_in) 
                                 FROM attendances a4 
                                 WHERE a4.user_id = attendances.user_id 
                                 AND a4.date = attendances.date)
                            )
                        )
                    ) as avg_time_out_seconds
                '),
                    // Count of late days, using a case-insensitive check for the 'late' field
                    DB::raw("
                    SUM(CASE WHEN LOWER(attendances.late) = 'late' THEN 1 ELSE 0 END) as total_lates
                ")
                )
                ->groupBy('users.name')
                ->first();

            if (!$records) {
                return response()->json([
                    'message' => 'No attendance records found for the specified date range.'
                ], 404);
            }

            $avgMinutesPerDay = $records->total_minutes / $records->days_worked;

            $response = [
                'name' => $records->name,
                'days_worked' => $records->days_worked,
                'total_hours' => floor($records->total_minutes / 60) . ' hours ' . ($records->total_minutes % 60) . ' minutes',
                'avg_hours_per_day' => floor($avgMinutesPerDay / 60) . ' hours ' . (round($avgMinutesPerDay) % 60) . ' minutes',
                'avg_time_in' => gmdate('H:i', $records->avg_time_in_seconds),
                'avg_time_out' => gmdate('H:i', $records->avg_time_out_seconds),
                'total_lates' => $records->total_lates // Include the count of late days
            ];

            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error generating date range report: ' . $e->getMessage());
            return response()->json(['message' => 'Error generating report'], 500);
        }
    }

    public function downloadAttendanceExcel(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'month' => 'required|integer|between:1,12',
                'year' => 'required|integer|min:2000'
            ]);

            // Fetch the attendance records for the given month and year
            $records = DB::table('attendances')
                ->join('users', 'attendances.user_id', '=', 'users.user_id')
                ->whereYear('attendances.date', $request->year)
                ->whereMonth('attendances.date', $request->month)
                ->select(
                    'users.user_id',
                    'users.name',
                    DB::raw('AVG(TIME_TO_SEC(TIME(time_in))) as avg_time_in_seconds'),
                    DB::raw('AVG(TIME_TO_SEC(TIME(time_out))) as avg_time_out_seconds'),
                    DB::raw('AVG(TIMESTAMPDIFF(MINUTE, time_in, time_out)) as avg_minutes_per_day'),
                    DB::raw('SUM(TIMESTAMPDIFF(MINUTE, time_in, time_out)) as total_minutes')
                )
                ->groupBy('users.user_id', 'users.name')
                ->get();

            // Create a new spreadsheet
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Set the spreadsheet headers
            $sheet->setCellValue('A1', 'User ID');
            $sheet->setCellValue('B1', 'Name');
            $sheet->setCellValue('C1', 'Average Time In');
            $sheet->setCellValue('D1', 'Average Time Out');
            $sheet->setCellValue('E1', 'Average Hours/Day');
            $sheet->setCellValue('F1', 'Total Hours');

            // Fill the spreadsheet with data
            $rowIndex = 2;
            foreach ($records as $record) {
                // Convert seconds to time format for avg_time_in and avg_time_out
                $avgTimeIn = gmdate("H:i", round($record->avg_time_in_seconds));
                $avgTimeOut = gmdate("H:i", round($record->avg_time_out_seconds));

                // Calculate average hours per day
                $avgHoursPerDay = floor($record->avg_minutes_per_day / 60) . ' hours ' .
                    ($record->avg_minutes_per_day % 60) . ' minutes';

                // Calculate total hours
                $totalHours = floor($record->total_minutes / 60) . ' hours ' .
                    ($record->total_minutes % 60) . ' minutes';

                $sheet->setCellValue('A' . $rowIndex, $record->user_id);
                $sheet->setCellValue('B' . $rowIndex, $record->name);
                $sheet->setCellValue('C' . $rowIndex, $avgTimeIn);
                $sheet->setCellValue('D' . $rowIndex, $avgTimeOut);
                $sheet->setCellValue('E' . $rowIndex, $avgHoursPerDay);
                $sheet->setCellValue('F' . $rowIndex, $totalHours);

                $rowIndex++;
            }

            // Auto-size columns
            foreach (range('A', 'F') as $column) {
                $sheet->getColumnDimension($column)->setAutoSize(true);
            }

            // Set the filename
            $fileName = "monthly_attendance_report_{$request->month}_{$request->year}.xlsx";

            // Create the response
            $response = new StreamedResponse(function () use ($spreadsheet) {
                $writer = new Xlsx($spreadsheet);
                $writer->save('php://output');
            });

            $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            $response->headers->set('Content-Disposition', "attachment;filename=\"{$fileName}\"");
            $response->headers->set('Cache-Control', 'max-age=0');

            return $response;
        } catch (\Exception $e) {
            Log::error('Error generating monthly Excel report: ' . $e->getMessage());
            return response()->json(['message' => 'Error generating report'], 500);
        }
    }

    public function previewMonthlyReport(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'month' => 'required|integer|between:1,12',
                'year' => 'required|integer|min:2000'
            ]);

            // Fetch the attendance records
            $records = DB::table('attendances')
                ->join('users', 'attendances.user_id', '=', 'users.user_id')
                ->whereYear('attendances.date', $request->year)
                ->whereMonth('attendances.date', $request->month)
                ->select(
                    'users.user_id',
                    'users.name',
                    DB::raw('AVG(TIME_TO_SEC(TIME(time_in))) as avg_time_in_seconds'),
                    DB::raw('AVG(TIME_TO_SEC(TIME(time_out))) as avg_time_out_seconds'),
                    DB::raw('AVG(TIMESTAMPDIFF(MINUTE, time_in, time_out)) as avg_minutes_per_day'),
                    DB::raw('SUM(TIMESTAMPDIFF(MINUTE, time_in, time_out)) as total_minutes')
                )
                ->groupBy('users.user_id', 'users.name')
                ->get();

            // Transform the data
            $records = $records->map(function ($record) {
                return [
                    'user_id' => $record->user_id,
                    'name' => $record->name,
                    'avg_time_in' => gmdate("H:i", round($record->avg_time_in_seconds)),
                    'avg_time_out' => gmdate("H:i", round($record->avg_time_out_seconds)),
                    'avg_hours_per_day' => floor($record->avg_minutes_per_day / 60) . ' hours ' .
                        ($record->avg_minutes_per_day % 60) . ' minutes',
                    'total_hours' => floor($record->total_minutes / 60) . ' hours ' .
                        ($record->total_minutes % 60) . ' minutes'
                ];
            });

            // Get month name
            $monthName = date('F', mktime(0, 0, 0, $request->month, 1));

            // Generate HTML content
            $html = view('reports.monthly-attendance', [
                'records' => $records,
                'month' => $monthName,
                'year' => $request->year
            ])->render();

            return response()->json([
                'html' => $html,
                'title' => "Monthly Attendance Report - $monthName $request->year"
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating monthly report preview: ' . $e->getMessage());
            return response()->json(['message' => 'Error generating report preview'], 500);
        }
    }

    // Add these new methods to your AttendanceController

    public function downloadDateRangeExcel(Request $request)
    {
        try {
            $request->validate([
                'from_date' => 'required|date',
                'to_date' => 'required|date|after_or_equal:from_date'
            ]);

            $fromDate = $request->from_date;
            $toDate = $request->to_date;

            // Fetch records for all employees within date range
            $records = DB::table('attendances')
                ->join('users', 'attendances.user_id', '=', 'users.user_id')
                ->whereBetween('attendances.date', [$fromDate, $toDate])
                ->select(
                    'users.user_id',
                    'users.name',
                    DB::raw('COUNT(DISTINCT attendances.date) as days_worked'),
                    DB::raw('AVG(TIME_TO_SEC(TIME(time_in))) as avg_time_in_seconds'),
                    DB::raw('AVG(TIME_TO_SEC(TIME(time_out))) as avg_time_out_seconds'),
                    DB::raw('AVG(TIMESTAMPDIFF(MINUTE, time_in, time_out)) as avg_minutes_per_day'),
                    DB::raw('SUM(TIMESTAMPDIFF(MINUTE, time_in, time_out)) as total_minutes'),
                    DB::raw('SUM(CASE WHEN LOWER(attendances.late) = "late" THEN 1 ELSE 0 END) as total_lates')
                )
                ->groupBy('users.user_id', 'users.name')
                ->get();

            // Create Excel file
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Set headers
            $sheet->setCellValue('A1', 'User ID');
            $sheet->setCellValue('B1', 'Name');
            $sheet->setCellValue('C1', 'Days Worked');
            $sheet->setCellValue('D1', 'Average Time In');
            $sheet->setCellValue('E1', 'Average Time Out');
            $sheet->setCellValue('F1', 'Average Hours/Day');
            $sheet->setCellValue('G1', 'Total Hours');
            $sheet->setCellValue('H1', 'Total Lates');

            // Fill data
            $row = 2;
            foreach ($records as $record) {
                $sheet->setCellValue('A' . $row, $record->user_id);
                $sheet->setCellValue('B' . $row, $record->name);
                $sheet->setCellValue('C' . $row, $record->days_worked);
                $sheet->setCellValue('D' . $row, gmdate("H:i", round($record->avg_time_in_seconds)));
                $sheet->setCellValue('E' . $row, gmdate("H:i", round($record->avg_time_out_seconds)));
                $sheet->setCellValue('F' . $row, floor($record->avg_minutes_per_day / 60) . ' hours ' .
                    ($record->avg_minutes_per_day % 60) . ' minutes');
                $sheet->setCellValue('G' . $row, floor($record->total_minutes / 60) . ' hours ' .
                    ($record->total_minutes % 60) . ' minutes');
                $sheet->setCellValue('H' . $row, $record->total_lates);
                $row++;
            }

            // Auto-size columns
            foreach (range('A', 'H') as $column) {
                $sheet->getColumnDimension($column)->setAutoSize(true);
            }

            // Create response
            $fileName = "attendance_report_{$fromDate}_to_{$toDate}.xlsx";

            $writer = new Xlsx($spreadsheet);
            $response = new StreamedResponse(function () use ($writer) {
                $writer->save('php://output');
            });

            $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            $response->headers->set('Content-Disposition', "attachment;filename=\"{$fileName}\"");
            $response->headers->set('Cache-Control', 'max-age=0');

            return $response;
        } catch (\Exception $e) {
            Log::error('Error generating date range Excel report: ' . $e->getMessage());
            return response()->json(['message' => 'Error generating report'], 500);
        }
    }

    public function previewDateRangeReport(Request $request)
    {
        try {
            $request->validate([
                'from_date' => 'required|date',
                'to_date' => 'required|date|after_or_equal:from_date'
            ]);

            $fromDate = $request->from_date;
            $toDate = $request->to_date;

            // Fetch records (same query as above)
            $records = DB::table('attendances')
                ->join('users', 'attendances.user_id', '=', 'users.user_id')
                ->whereBetween('attendances.date', [$fromDate, $toDate])
                ->select(
                    'users.user_id',
                    'users.name',
                    DB::raw('COUNT(DISTINCT attendances.date) as days_worked'),
                    DB::raw('AVG(TIME_TO_SEC(TIME(time_in))) as avg_time_in_seconds'),
                    DB::raw('AVG(TIME_TO_SEC(TIME(time_out))) as avg_time_out_seconds'),
                    DB::raw('AVG(TIMESTAMPDIFF(MINUTE, time_in, time_out)) as avg_minutes_per_day'),
                    DB::raw('SUM(TIMESTAMPDIFF(MINUTE, time_in, time_out)) as total_minutes'),
                    DB::raw('SUM(CASE WHEN LOWER(attendances.late) = "late" THEN 1 ELSE 0 END) as total_lates')
                )
                ->groupBy('users.user_id', 'users.name')
                ->get();

            // Transform records for view
            $records = $records->map(function ($record) {
                return [
                    'user_id' => $record->user_id,
                    'name' => $record->name,
                    'days_worked' => $record->days_worked,
                    'avg_time_in' => gmdate("H:i", round($record->avg_time_in_seconds)),
                    'avg_time_out' => gmdate("H:i", round($record->avg_time_out_seconds)),
                    'avg_hours_per_day' => floor($record->avg_minutes_per_day / 60) . ' hours ' .
                        ($record->avg_minutes_per_day % 60) . ' minutes',
                    'total_hours' => floor($record->total_minutes / 60) . ' hours ' .
                        ($record->total_minutes % 60) . ' minutes',
                    'total_lates' => $record->total_lates
                ];
            });

            // Generate HTML view
            $html = view('reports.date-range-attendance', [
                'records' => $records,
                'fromDate' => $fromDate,
                'toDate' => $toDate
            ])->render();

            return response()->json([
                'html' => $html,
                'title' => "Attendance Report ($fromDate to $toDate)"
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating date range report preview: ' . $e->getMessage());
            return response()->json(['message' => 'Error generating preview'], 500);
        }
    }
}
