<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Payroll;
use App\Models\User;
use App\Services\PayrollService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log; // Include the Log facade

class PayrollController extends Controller
{
    public function generatePayroll(Request $request, $userId)
    {
        try {
            // Log the start of the payroll generation process
            Log::info("Starting payroll generation for user ID: {$userId}");

            // Find the user by the user_id, not the default id
            $user = User::where('user_id', $userId)->firstOrFail();

            $hourlyRate = $request->query('hourly_rate');
            $tax = $request->query('tax');
            $deductions = $request->query('deductions');

            // Log the inputs
            Log::info("Hourly Rate: {$hourlyRate}, Tax: {$tax}, Deductions: {$deductions}");

            // Call the PayrollService to calculate the payroll
            $payroll = PayrollService::calculatePayroll($user, $hourlyRate, $tax, $deductions);

            // Log successful payroll generation
            Log::info("Payroll generated for user ID: {$userId}");

            return response()->json($payroll);
        } catch (\Exception $e) {
            // Log any errors that occur
            Log::error("Error generating payroll for user ID: {$userId}. Error: " . $e->getMessage());
            return response()->json(['error' => 'Payroll generation failed'], 500);
        }
    }

    public function getNetSalary($userId)
    {
        // Log the incoming request
        Log::info("Fetching net salary for user ID: {$userId}");

        $payroll = Payroll::where('user_id', $userId)->first(); // Get the latest payroll entry

        if ($payroll) {
            // Log the found payroll record
            Log::info("Payroll record found for user ID: {$userId}", [
                'net_salary' => $payroll->net_salary,
            ]);
            return response()->json(['net_salary' => $payroll->net_salary]);
        } else {
            // Log the absence of a payroll record
            Log::warning("No payroll record found for user ID: {$userId}");
            return response()->json(['message' => 'No payroll record found.'], 404);
        }
    }
    public function salaryHistory()
    {
        $user = Auth::user(); // Get the authenticated user
        $payrolls = $user->payrolls; // Fetch the associated payrolls

        return response()->json($payrolls); // Return payrolls as JSON
    }
}
