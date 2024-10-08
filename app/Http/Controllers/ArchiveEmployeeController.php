<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Models\ArchivedEmployee;
use Illuminate\Support\Facades\Log; // Import the Log facade
use Illuminate\Support\Facades\DB;


class ArchiveEmployeeController extends Controller
{
    public function delete($user_id)
    {
        // Find the employee to delete
        $employee = User::where("user_id", $user_id)->first();

        if (!$employee) {
            // Log an error message
            Log::error('Employee not found.', ['employee_id' => $user_id]);

            return response()->json(['message' => 'Employee not found.'], 404);
        }

        try {
            // Archive the employee
            ArchivedEmployee::create([
                'user_id' => $employee->user_id,
                'name' => $employee->name,
                'email' => $employee->email,
                'contact_number' => $employee->contact_number,
                'gender' => $employee->gender,
                'position' => $employee->position,
                'profile' => $employee->profile,
                'address' => $employee->address,
                'salary' => $employee->salary,
                'leave' => $employee->leave,
                'password' => $employee->password,
                'birthdate' => $employee->birthdate,
                'rfid' => $employee->rfid
            ]);

            // Delete the employee
            $employee->delete();

            return response()->json(['message' => 'Employee deleted and archived successfully.']);
        } catch (\Exception $e) {
            // Log the exception
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
        // Begin a database transaction
        DB::beginTransaction();

        try {
            // Find the archived employee by ID (use the primary key `id`)
            $archivedEmployee = ArchivedEmployee::find($id);

            if (!$archivedEmployee) {
                // Log an error message
                Log::error('Archived employee not found.', ['archived_employee_id' => $id]);

                return response()->json(['message' => 'Archived employee not found.'], 404);
            }

            // Restore the employee to the users table
            User::create([
                "user_id" => $archivedEmployee->user_id,
                'name' => $archivedEmployee->name,
                'email' => $archivedEmployee->email,
                'contact_number' => $archivedEmployee->contact_number,
                'gender' => $archivedEmployee->gender,
                'position' => $archivedEmployee->position,
                'profile' => $archivedEmployee->profile,
                'address' => $archivedEmployee->address,
                'salary' => $archivedEmployee->salary,
                'leave' => $archivedEmployee->leave,
                'password' => $archivedEmployee->password,
                'employee_type' => $archivedEmployee->employee_type,
                'birthdate' => $archivedEmployee->birthdate,
                'rfid' => $archivedEmployee->rfid
            ]);

            // Delete the archived employee
            $archivedEmployee->delete();

            // Commit the transaction
            DB::commit();

            return response()->json(['message' => 'Employee restored successfully.']);
        } catch (\Exception $e) {
            // Rollback the transaction if something goes wrong
            DB::rollBack();

            // Log the exception
            Log::error('Failed to restore employee.', [
                'archived_employee_id' => $id,
                'exception' => $e->getMessage()
            ]);

            return response()->json(['message' => 'Failed to restore employee.'], 500);
        }
    }
}
