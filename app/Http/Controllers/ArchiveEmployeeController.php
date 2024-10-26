<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Models\ArchivedEmployee;
use App\Models\RfidCard;
use Illuminate\Support\Facades\Log; // Import the Log facade
use Illuminate\Support\Facades\DB;


class ArchiveEmployeeController extends Controller
{
    public function delete($user_id)
    {
        $employee = User::where("user_id", $user_id)->first();

        if (!$employee) {
            Log::error('Employee not found.', ['employee_id' => $user_id]);
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        try {
            DB::beginTransaction();

            // Unassign RFID card if exists
            if ($employee->rfid) {
                $rfidCard = RfidCard::where('rfid_uid', $employee->rfid)->first();
                if ($rfidCard) {
                    $rfidCard->status = 'available';
                    $rfidCard->save();
                }
            }

            // Get all employee data
            $employeeData = $employee->toArray();

            // Create archived employee with explicitly set fields
            ArchivedEmployee::create([
                'user_id' => $employee->user_id,
                'name' => $employee->name,
                'email' => $employee->email,
                'password' => $employee->password, // Explicitly include password
                'first_name' => $employee->first_name,
                'last_name' => $employee->last_name,
                'middle_name' => $employee->middle_name,
                'date_of_birth' => $employee->date_of_birth,
                'gender' => $employee->gender,
                'marital_status' => $employee->marital_status,
                'nationality' => $employee->nationality,
                'mothers_maiden_name' => $employee->mothers_maiden_name,
                'fathers_name' => $employee->fathers_name,
                'address' => $employee->address,
                'city' => $employee->city,
                'province' => $employee->province,
                'postal_code' => $employee->postal_code,
                'country' => $employee->country,
                'personal_email' => $employee->personal_email,
                'work_email' => $employee->work_email,
                'home_phone' => $employee->home_phone,
                'contact_number' => $employee->contact_number,
                'emergency_contact_name' => $employee->emergency_contact_name,
                'emergency_contact_relationship' => $employee->emergency_contact_relationship,
                'emergency_contact_phone' => $employee->emergency_contact_phone,
                'hire_date' => $employee->hire_date,
                'employment_status' => $employee->employment_status,
                'position' => $employee->position,
                'department' => $employee->department,
                'reporting_manager' => $employee->reporting_manager,
                'work_location' => $employee->work_location,
                'employee_type' => $employee->employee_type,
                'probation_end_date' => $employee->probation_end_date,
                'current_salary' => $employee->current_salary,
                'pay_frequency' => $employee->pay_frequency,
                'highest_degree_earned' => $employee->highest_degree_earned,
                'field_of_study' => $employee->field_of_study,
                'institution_name' => $employee->institution_name,
                'graduation_year' => $employee->graduation_year,
                'work_history' => $employee->work_history,
                'health_insurance_plan' => $employee->health_insurance_plan,
                'sick_leave_balance' => $employee->sick_leave_balance,
                'suffix' => $employee->suffix,
                'completed_training_programs' => $employee->completed_training_programs,
                'work_permit_expiry_date' => $employee->work_permit_expiry_date,
                'profile' => $employee->profile,
                'notes' => $employee->notes,
                'email_verified_at' => $employee->email_verified_at,
                'schedule' => $employee->schedule
            ]);

            // Delete the employee
            $employee->delete();

            DB::commit();

            return response()->json([
                'message' => 'Employee deleted and archived successfully.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete and archive employee.', [
                'employee_id' => $user_id,
                'exception' => $e->getMessage()
            ]);
            return response()->json(['message' => 'Failed to delete and archive employee.'], 500);
        }
    }


    public function permanentDelete($user_id)
    {
        // Log the type of $user_id for debugging purposes
        Log::info('Received user_id:', ['type' => gettype($user_id), 'value' => $user_id]);

        // Attempt to find the employee by user_id
        $employee = ArchivedEmployee::where("user_id", $user_id)->first();

        if (!$employee) {
            Log::error('Employee not found.', ['employee_id' => $user_id]);
            return response()->json(['message' => 'Employee not found.'], 404);
        }

        try {
            // Permanently delete the employee using forceDelete
            $employee->delete();
            return response()->json(['message' => 'Employee deleted permanently.']);
        } catch (\Exception $e) {
            Log::error('Failed to delete employee.', ['exception' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to delete employee.'], 500);
        }
    }


    public function index()
    {
        // Fetch all archived employees
        $archivedEmployees = ArchivedEmployee::all();

        // Return as JSON response
        return response()->json($archivedEmployees);
    }

    public function restore($id)
    {
        DB::beginTransaction();

        try {
            $archivedEmployee = ArchivedEmployee::find($id);

            if (!$archivedEmployee) {
                Log::error('Archived employee not found.', ['archived_employee_id' => $id]);
                return response()->json(['message' => 'Archived employee not found.'], 404);
            }

            // Get all employee data
            $employeeData = $archivedEmployee->toArray();

            // Check if there are any available RFID cards
            $availableRfid = RfidCard::where('status', 'available')->first();

            if (!$availableRfid) {
                DB::rollBack();
                return response()->json(['message' => 'No available RFID cards for restoration.'], 400);
            }

            // Create user with all required fields
            User::create([
                'user_id' => $archivedEmployee->user_id,
                'name' => $archivedEmployee->name,
                'email' => $archivedEmployee->email,
                'password' => $archivedEmployee->password,
                'first_name' => $archivedEmployee->first_name,
                'last_name' => $archivedEmployee->last_name,
                'middle_name' => $archivedEmployee->middle_name,
                'date_of_birth' => $archivedEmployee->date_of_birth,
                'gender' => $archivedEmployee->gender,
                'marital_status' => $archivedEmployee->marital_status,
                'nationality' => $archivedEmployee->nationality,
                'mothers_maiden_name' => $archivedEmployee->mothers_maiden_name,
                'fathers_name' => $archivedEmployee->fathers_name,
                'address' => $archivedEmployee->address,
                'city' => $archivedEmployee->city,
                'province' => $archivedEmployee->province,
                'postal_code' => $archivedEmployee->postal_code,
                'country' => $archivedEmployee->country,
                'personal_email' => $archivedEmployee->personal_email,
                'work_email' => $archivedEmployee->work_email,
                'home_phone' => $archivedEmployee->home_phone,
                'contact_number' => $archivedEmployee->contact_number,
                'emergency_contact_name' => $archivedEmployee->emergency_contact_name,
                'emergency_contact_relationship' => $archivedEmployee->emergency_contact_relationship,
                'emergency_contact_phone' => $archivedEmployee->emergency_contact_phone,
                'hire_date' => $archivedEmployee->hire_date,
                'employment_status' => $archivedEmployee->employment_status,
                'position' => $archivedEmployee->position,
                'department' => $archivedEmployee->department,
                'reporting_manager' => $archivedEmployee->reporting_manager,
                'work_location' => $archivedEmployee->work_location,
                'employee_type' => $archivedEmployee->employee_type,
                'probation_end_date' => $archivedEmployee->probation_end_date,
                'current_salary' => $archivedEmployee->current_salary ?? 0.00,
                'pay_frequency' => $archivedEmployee->pay_frequency,
                'highest_degree_earned' => $archivedEmployee->highest_degree_earned,
                'field_of_study' => $archivedEmployee->field_of_study,
                'institution_name' => $archivedEmployee->institution_name,
                'graduation_year' => $archivedEmployee->graduation_year,
                'work_history' => $archivedEmployee->work_history,
                'health_insurance_plan' => $archivedEmployee->health_insurance_plan,
                'sick_leave_balance' => $archivedEmployee->sick_leave_balance ?? 15,
                'suffix' => $archivedEmployee->suffix,
                'completed_training_programs' => $archivedEmployee->completed_training_programs,
                'work_permit_expiry_date' => $archivedEmployee->work_permit_expiry_date,
                'profile' => $archivedEmployee->profile,
                'notes' => $archivedEmployee->notes,
                'schedule' => $archivedEmployee->schedule,
                'rfid' => $availableRfid->rfid_uid // Assign available RFID
            ]);

            // Update RFID card status
            $availableRfid->status = 'assigned';
            $availableRfid->save();

            // Delete the archived employee
            $archivedEmployee->delete();

            DB::commit();

            return response()->json(['message' => 'Employee restored successfully.']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to restore employee.', [
                'archived_employee_id' => $id,
                'exception' => $e->getMessage()
            ]);
            return response()->json(['message' => 'Failed to restore employee.'], 500);
        }
    }
}
