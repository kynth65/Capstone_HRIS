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
            // First get the daily totals using a subquery
            $dailyTotals = DB::table('attendances AS a')
                ->select(
                    'a.user_id',
                    'a.date',
                    DB::raw('MIN(time_in) as first_time_in'),
                    DB::raw('
                        CASE 
                            WHEN MAX(time_out) = MIN(time_in) THEN NULL
                            ELSE MAX(time_out)
                        END as last_time_out
                    ')
                )
                ->whereYear('a.date', $year)
                ->whereMonth('a.date', $month)
                ->whereNotNull('time_in')
                ->groupBy('a.user_id', 'a.date');
    
            // Then get the monthly totals
            $attendanceRecords = DB::table('users')
                ->joinSub($dailyTotals, 'daily', function ($join) {
                    $join->on('users.user_id', '=', 'daily.user_id');
                })
                ->select(
                    'users.user_id',
                    'users.name',
                    // Calculate total minutes for the month
                    DB::raw('
                        SUM(
                            CASE 
                                WHEN last_time_out IS NOT NULL 
                                THEN TIMESTAMPDIFF(MINUTE, first_time_in, last_time_out)
                                ELSE 0
                            END
                        ) as total_minutes
                    '),
                    // Calculate average time in
                    DB::raw('
                        SEC_TO_TIME(
                            AVG(
                                TIME_TO_SEC(TIME(first_time_in))
                            )
                        ) as avg_time_in
                    '),
                    // Calculate average time out
                    DB::raw('
                        SEC_TO_TIME(
                            AVG(
                                TIME_TO_SEC(TIME(COALESCE(last_time_out, first_time_in)))
                            )
                        ) as avg_time_out
                    '),
                    // Calculate daily average
                    DB::raw('
                        AVG(
                            CASE 
                                WHEN last_time_out IS NOT NULL 
                                THEN TIMESTAMPDIFF(MINUTE, first_time_in, last_time_out)
                                ELSE 0
                            END
                        ) as avg_daily_minutes
                    '),
                    // Count work days
                    DB::raw('COUNT(DISTINCT daily.date) as days_worked')
                )
                ->groupBy('users.user_id', 'users.name')
                ->get();
    
            $attendanceRecords->transform(function ($record) {
                // Format total hours
                $hours = floor($record->total_minutes / 60);
                $minutes = $record->total_minutes % 60;
                $record->total_hours = $hours . ' hours ' . $minutes . ' minutes';
    
                // Format average time in/out
                $record->avg_time_in = substr($record->avg_time_in, 0, 5);
                $record->avg_time_out = substr($record->avg_time_out, 0, 5);
    
                // Format average hours per day
                $avgHours = floor($record->avg_daily_minutes / 60);
                $avgMinutes = round($record->avg_daily_minutes) % 60;
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
    
            // First get daily totals
            $dailyTotals = DB::table('attendances AS a')
                ->select(
                    'a.user_id',
                    'a.date',
                    DB::raw('MIN(time_in) as first_time_in'),
                    DB::raw('
                        CASE 
                            WHEN MAX(time_out) = MIN(time_in) THEN NULL
                            ELSE MAX(time_out)
                        END as last_time_out
                    ')
                )
                ->where('a.user_id', $request->user_id)
                ->whereBetween('a.date', [$request->from_date, $request->to_date])
                ->whereNotNull('time_in')
                ->groupBy('a.user_id', 'a.date');
    
            // Calculate totals
            $records = DB::table('users')
                ->joinSub($dailyTotals, 'daily', function ($join) {
                    $join->on('users.user_id', '=', 'daily.user_id');
                })
                ->where('users.user_id', $request->user_id)
                ->select(
                    'users.user_id',
                    'users.name',
                    // Calculate total minutes
                    DB::raw('
                        SUM(
                            CASE 
                                WHEN last_time_out IS NOT NULL 
                                THEN TIMESTAMPDIFF(MINUTE, first_time_in, last_time_out)
                                ELSE 0
                            END
                        ) as total_minutes
                    '),
                    // Calculate average time in
                    DB::raw('
                        SEC_TO_TIME(
                            AVG(
                                TIME_TO_SEC(TIME(first_time_in))
                            )
                        ) as avg_time_in
                    '),
                    // Calculate average time out
                    DB::raw('
                        SEC_TO_TIME(
                            AVG(
                                TIME_TO_SEC(TIME(COALESCE(last_time_out, first_time_in)))
                            )
                        ) as avg_time_out
                    '),
                    // Count work days
                    DB::raw('COUNT(DISTINCT daily.date) as days_worked'),
                    // Count late days
                    DB::raw('
                        SUM(
                            EXISTS (
                                SELECT 1 FROM attendances a2 
                                WHERE a2.user_id = users.user_id 
                                AND DATE(a2.date) = DATE(daily.date)
                                AND LOWER(a2.late) = "late"
                            )
                        ) as total_lates
                    ')
                )
                ->groupBy('users.user_id', 'users.name')
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
                'avg_time_in' => substr($records->avg_time_in, 0, 5),
                'avg_time_out' => substr($records->avg_time_out, 0, 5),
                'total_lates' => $records->total_lates
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
        $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2000'
        ]);

        // First get the daily totals using a subquery
        $dailyTotals = DB::table('attendances AS a')
            ->select(
                'a.user_id',
                'a.date',
                DB::raw('MIN(time_in) as first_time_in'),
                DB::raw('
                    CASE 
                        WHEN MAX(time_out) = MIN(time_in) THEN NULL
                        ELSE MAX(time_out)
                    END as last_time_out
                ')
            )
            ->whereYear('a.date', $request->year)
            ->whereMonth('a.date', $request->month)
            ->whereNotNull('time_in')
            ->groupBy('a.user_id', 'a.date');

        // Get monthly totals
        $records = DB::table('users')
            ->joinSub($dailyTotals, 'daily', function ($join) {
                $join->on('users.user_id', '=', 'daily.user_id');
            })
            ->select(
                'users.user_id',
                'users.name',
                // Calculate total minutes
                DB::raw('
                    SUM(
                        CASE 
                            WHEN last_time_out IS NOT NULL 
                            THEN TIMESTAMPDIFF(MINUTE, first_time_in, last_time_out)
                            ELSE 0
                        END
                    ) as total_minutes
                '),
                // Calculate average time in
                DB::raw('
                    SEC_TO_TIME(
                        AVG(
                            TIME_TO_SEC(TIME(first_time_in))
                        )
                    ) as avg_time_in
                '),
                // Calculate average time out
                DB::raw('
                    SEC_TO_TIME(
                        AVG(
                            TIME_TO_SEC(TIME(COALESCE(last_time_out, first_time_in)))
                        )
                    ) as avg_time_out
                '),
                // Calculate daily average
                DB::raw('
                    AVG(
                        CASE 
                            WHEN last_time_out IS NOT NULL 
                            THEN TIMESTAMPDIFF(MINUTE, first_time_in, last_time_out)
                            ELSE 0
                        END
                    ) as avg_daily_minutes
                '),
                DB::raw('COUNT(DISTINCT daily.date) as days_worked')
            )
            ->groupBy('users.user_id', 'users.name')
            ->get();

        // Create Excel file
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $sheet->setCellValue('A1', 'User ID');
        $sheet->setCellValue('B1', 'Name');
        $sheet->setCellValue('C1', 'Average Time In');
        $sheet->setCellValue('D1', 'Average Time Out');
        $sheet->setCellValue('E1', 'Average Hours/Day');
        $sheet->setCellValue('F1', 'Total Hours');
        $sheet->setCellValue('G1', 'Days Worked');

        // Fill data
        $rowIndex = 2;
        foreach ($records as $record) {
            $sheet->setCellValue('A' . $rowIndex, $record->user_id);
            $sheet->setCellValue('B' . $rowIndex, $record->name);
            $sheet->setCellValue('C' . $rowIndex, substr($record->avg_time_in, 0, 5));
            $sheet->setCellValue('D' . $rowIndex, substr($record->avg_time_out, 0, 5));
            
            // Calculate and format average hours per day
            $avgHours = floor($record->avg_daily_minutes / 60);
            $avgMinutes = round($record->avg_daily_minutes) % 60;
            $sheet->setCellValue('E' . $rowIndex, $avgHours . ' hours ' . $avgMinutes . ' minutes');

            // Calculate and format total hours
            $totalHours = floor($record->total_minutes / 60);
            $totalMinutes = $record->total_minutes % 60;
            $sheet->setCellValue('F' . $rowIndex, $totalHours . ' hours ' . $totalMinutes . ' minutes');
            
            $sheet->setCellValue('G' . $rowIndex, $record->days_worked);
            $rowIndex++;
        }

        // Auto-size columns
        foreach (range('A', 'G') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        // Set response headers
        $fileName = "monthly_attendance_report_{$request->month}_{$request->year}.xlsx";
        $writer = new Xlsx($spreadsheet);
        
        $response = new StreamedResponse(function () use ($writer) {
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
        $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2000'
        ]);

        // First get the daily totals using a subquery
        $dailyTotals = DB::table('attendances AS a')
            ->select(
                'a.user_id',
                'a.date',
                DB::raw('MIN(time_in) as first_time_in'),
                DB::raw('
                    CASE 
                        WHEN MAX(time_out) = MIN(time_in) THEN NULL
                        ELSE MAX(time_out)
                    END as last_time_out
                ')
            )
            ->whereYear('a.date', $request->year)
            ->whereMonth('a.date', $request->month)
            ->whereNotNull('time_in')
            ->groupBy('a.user_id', 'a.date');

        // Then get the monthly totals
        $records = DB::table('users')
            ->joinSub($dailyTotals, 'daily', function ($join) {
                $join->on('users.user_id', '=', 'daily.user_id');
            })
            ->select(
                'users.user_id',
                'users.name',
                // Calculate total minutes for the month
                DB::raw('
                    SUM(
                        CASE 
                            WHEN last_time_out IS NOT NULL 
                            THEN TIMESTAMPDIFF(MINUTE, first_time_in, last_time_out)
                            ELSE 0
                        END
                    ) as total_minutes
                '),
                // Calculate average time in
                DB::raw('
                    SEC_TO_TIME(
                        AVG(
                            TIME_TO_SEC(TIME(first_time_in))
                        )
                    ) as avg_time_in
                '),
                // Calculate average time out
                DB::raw('
                    SEC_TO_TIME(
                        AVG(
                            TIME_TO_SEC(TIME(COALESCE(last_time_out, first_time_in)))
                        )
                    ) as avg_time_out
                '),
                // Calculate daily average
                DB::raw('
                    AVG(
                        CASE 
                            WHEN last_time_out IS NOT NULL 
                            THEN TIMESTAMPDIFF(MINUTE, first_time_in, last_time_out)
                            ELSE 0
                        END
                    ) as avg_daily_minutes
                '),
                // Count work days
                DB::raw('COUNT(DISTINCT daily.date) as days_worked')
            )
            ->groupBy('users.user_id', 'users.name')
            ->get();

        // Transform the data
        $formattedRecords = $records->map(function ($record) {
            return [
                'user_id' => $record->user_id,
                'name' => $record->name,
                'avg_time_in' => substr($record->avg_time_in, 0, 5),
                'avg_time_out' => substr($record->avg_time_out, 0, 5),
                'avg_hours_per_day' => floor($record->avg_daily_minutes / 60) . ' hours ' . 
                    (round($record->avg_daily_minutes) % 60) . ' minutes',
                'total_hours' => floor($record->total_minutes / 60) . ' hours ' . 
                    ($record->total_minutes % 60) . ' minutes',
                'days_worked' => $record->days_worked
            ];
        });

        // Get month name
        $monthName = date('F', mktime(0, 0, 0, $request->month, 1));

        // Generate HTML content
        $html = view('reports.monthly-attendance', [
            'records' => $formattedRecords,
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
    
            // First get the daily totals using a subquery
            $dailyTotals = DB::table('attendances AS a')
                ->select(
                    'a.user_id',
                    'a.date',
                    DB::raw('MIN(time_in) as first_time_in'),
                    DB::raw('
                        CASE 
                            WHEN MAX(time_out) = MIN(time_in) THEN NULL
                            ELSE MAX(time_out)
                        END as last_time_out
                    ')
                )
                ->whereBetween('a.date', [$request->from_date, $request->to_date])
                ->whereNotNull('time_in')
                ->groupBy('a.user_id', 'a.date');
    
            // Get totals for the date range
            $records = DB::table('users')
                ->joinSub($dailyTotals, 'daily', function ($join) {
                    $join->on('users.user_id', '=', 'daily.user_id');
                })
                ->select(
                    'users.user_id',
                    'users.name',
                    // Calculate total minutes
                    DB::raw('
                        SUM(
                            CASE 
                                WHEN last_time_out IS NOT NULL 
                                THEN TIMESTAMPDIFF(MINUTE, first_time_in, last_time_out)
                                ELSE 0
                            END
                        ) as total_minutes
                    '),
                    // Calculate average time in
                    DB::raw('
                        SEC_TO_TIME(
                            AVG(
                                TIME_TO_SEC(TIME(first_time_in))
                            )
                        ) as avg_time_in
                    '),
                    // Calculate average time out
                    DB::raw('
                        SEC_TO_TIME(
                            AVG(
                                TIME_TO_SEC(TIME(COALESCE(last_time_out, first_time_in)))
                            )
                        ) as avg_time_out
                    '),
                    // Calculate daily average
                    DB::raw('
                        AVG(
                            CASE 
                                WHEN last_time_out IS NOT NULL 
                                THEN TIMESTAMPDIFF(MINUTE, first_time_in, last_time_out)
                                ELSE 0
                            END
                        ) as avg_daily_minutes
                    '),
                    // Count work days
                    DB::raw('COUNT(DISTINCT daily.date) as days_worked'),
                    // Count late days
                    DB::raw('
                        SUM(
                            EXISTS (
                                SELECT 1 FROM attendances a2 
                                WHERE a2.user_id = users.user_id 
                                AND DATE(a2.date) = DATE(daily.date)
                                AND LOWER(a2.late) = "late"
                            )
                        ) as total_lates
                    ')
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
                $sheet->setCellValue('D' . $row, substr($record->avg_time_in, 0, 5));
                $sheet->setCellValue('E' . $row, substr($record->avg_time_out, 0, 5));
                
                // Format average hours per day
                $avgHours = floor($record->avg_daily_minutes / 60);
                $avgMinutes = round($record->avg_daily_minutes) % 60;
                $sheet->setCellValue('F' . $row, $avgHours . ' hours ' . $avgMinutes . ' minutes');
                
                // Format total hours
                $totalHours = floor($record->total_minutes / 60);
                $totalMinutes = $record->total_minutes % 60;
                $sheet->setCellValue('G' . $row, $totalHours . ' hours ' . $totalMinutes . ' minutes');
                
                $sheet->setCellValue('H' . $row, $record->total_lates);
                $row++;
            }
    
            // Auto-size columns
            foreach (range('A', 'H') as $column) {
                $sheet->getColumnDimension($column)->setAutoSize(true);
            }
    
            // Set response headers
            $fileName = "attendance_report_{$request->from_date}_to_{$request->to_date}.xlsx";
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
    
            // First get the daily totals using a subquery
            $dailyTotals = DB::table('attendances AS a')
                ->select(
                    'a.user_id',
                    'a.date',
                    DB::raw('MIN(time_in) as first_time_in'),
                    DB::raw('
                        CASE 
                            WHEN MAX(time_out) = MIN(time_in) THEN NULL
                            ELSE MAX(time_out)
                        END as last_time_out
                    ')
                )
                ->whereBetween('a.date', [$request->from_date, $request->to_date])
                ->whereNotNull('time_in')
                ->groupBy('a.user_id', 'a.date');
    
            // Then get the totals for the date range
            $records = DB::table('users')
                ->joinSub($dailyTotals, 'daily', function ($join) {
                    $join->on('users.user_id', '=', 'daily.user_id');
                })
                ->select(
                    'users.user_id',
                    'users.name',
                    // Calculate total minutes
                    DB::raw('
                        SUM(
                            CASE 
                                WHEN last_time_out IS NOT NULL 
                                THEN TIMESTAMPDIFF(MINUTE, first_time_in, last_time_out)
                                ELSE 0
                            END
                        ) as total_minutes
                    '),
                    // Calculate average time in
                    DB::raw('
                        SEC_TO_TIME(
                            AVG(
                                TIME_TO_SEC(TIME(first_time_in))
                            )
                        ) as avg_time_in
                    '),
                    // Calculate average time out
                    DB::raw('
                        SEC_TO_TIME(
                            AVG(
                                TIME_TO_SEC(TIME(COALESCE(last_time_out, first_time_in)))
                            )
                        ) as avg_time_out
                    '),
                    // Calculate daily average
                    DB::raw('
                        AVG(
                            CASE 
                                WHEN last_time_out IS NOT NULL 
                                THEN TIMESTAMPDIFF(MINUTE, first_time_in, last_time_out)
                                ELSE 0
                            END
                        ) as avg_daily_minutes
                    '),
                    // Count work days
                    DB::raw('COUNT(DISTINCT daily.date) as days_worked'),
                    // Count late days
                    DB::raw('
                        SUM(
                            EXISTS (
                                SELECT 1 FROM attendances a2 
                                WHERE a2.user_id = users.user_id 
                                AND DATE(a2.date) = DATE(daily.date)
                                AND LOWER(a2.late) = "late"
                            )
                        ) as total_lates
                    ')
                )
                ->groupBy('users.user_id', 'users.name')
                ->get();
    
            // Transform records for view
            $formattedRecords = $records->map(function ($record) {
                return [
                    'user_id' => $record->user_id,
                    'name' => $record->name,
                    'days_worked' => $record->days_worked,
                    'avg_time_in' => substr($record->avg_time_in, 0, 5),
                    'avg_time_out' => substr($record->avg_time_out, 0, 5),
                    'avg_hours_per_day' => floor($record->avg_daily_minutes / 60) . ' hours ' . 
                        (round($record->avg_daily_minutes) % 60) . ' minutes',
                    'total_hours' => floor($record->total_minutes / 60) . ' hours ' . 
                        ($record->total_minutes % 60) . ' minutes',
                    'total_lates' => $record->total_lates
                ];
            });
    
            // Generate HTML view
            $html = view('reports.date-range-attendance', [
                'records' => $formattedRecords,
                'fromDate' => $request->from_date,
                'toDate' => $request->to_date
            ])->render();
    
            return response()->json([
                'html' => $html,
                'title' => "Attendance Report ({$request->from_date} to {$request->to_date})"
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating date range report preview: ' . $e->getMessage());
            return response()->json(['message' => 'Error generating preview'], 500);
        }
    }
}
