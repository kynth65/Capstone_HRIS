<?php

namespace App\Services;

use App\Models\Payroll;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log; // Include the Log facade

class PayrollService
{
  public static function calculatePayroll($user, $hourlyRate, $tax, $deductions)
  {


    try {
      // Log the start of the payroll calculation
      Log::info("Starting payroll calculation for user: {$user->name} (ID: {$user->user_id})");

      // Get all user attendance records within the pay period
      $attendances = Attendance::where('user_id', $user->user_id)->where('status', 'present')->get();

      // Log number of attendance records found
      Log::info("Found " . count($attendances) . " attendance records for user ID: {$user->user_id}");

      // Calculate total working hours from attendance records
      $totalMinutesWorked = 0;
      foreach ($attendances as $attendance) {
        $totalMinutesWorked += $attendance->calculateWorkTime();
      }

      //  $totalHoursWorked = $totalMinutesWorked / 60;
      $totalHoursWorked = 248;


      // Log total hours worked
      Log::info("Total hours worked for user ID {$user->user_id}: {$totalHoursWorked}");

      // Get user's hourly rate
      // $hourlyRate = $user->hourly_rate;
      // $hourlyRate = 80;


      // Create Payroll instance and calculate values
      $payroll = new Payroll();
      $payroll->user_id = $user->user_id;
      $payroll->hourly_rate = $hourlyRate;
      $payroll->working_hours = $totalHoursWorked;
      $payroll->tax = $tax;
      $payroll->deductions = $deductions;

      // Log hourly rate and tax applied
      Log::info("Hourly rate for user ID {$user->user_id}: {$hourlyRate}. Tax applied: {$payroll->tax}");

      // Calculate gross and net salary
      $grossSalary = $payroll->calculateGrossSalary();
      $netSalary = $payroll->calculateNetSalary();

      // Log salary calculations
      Log::info("Gross salary for user ID {$user->user_id}: {$grossSalary}, Net salary: {$netSalary}");

      // Store the payroll
      $payroll->gross_salary = $grossSalary;
      $payroll->net_salary = $netSalary;
      $payroll->save();

      // Log successful payroll save
      Log::info("Payroll saved for user ID: {$user->user_id}");

      return $payroll;
    } catch (\Exception $e) {
      // Log any errors that occur during payroll calculation
      Log::error("Error calculating payroll for user ID: {$user->user_id}. Error: " . $e->getMessage());
      throw $e;
    }
  }
}