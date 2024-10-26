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

            // Archive all employee data
            ArchivedEmployee::create($employee->toArray());

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

            // Restore all employee data
            $userData = $archivedEmployee->toArray();
            unset($userData['id']); // Remove the archived record's ID
            User::create($userData);

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
