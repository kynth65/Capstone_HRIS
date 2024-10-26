<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Departments;
use App\Models\AddPosition;

class DepartmentController extends Controller
{
    public function store(Request $request)
    {
        // Validate the request data
        $validated = $request->validate([
            'department' => 'required|string|max:255',
            'positions' => 'required|array|min:1',
            'positions.*' => 'required|string|max:255',
        ]);

        // Create a new department
        $department = Departments::create([
            'name' => $validated['department'],
        ]);

        // Create the positions associated with the department
        foreach ($validated['positions'] as $position) {
            AddPosition::create([
                'department_id' => $department->id,
                'name' => $position,
            ]);
        }

        return response()->json(['message' => 'Department and positions saved successfully!'], 200);
    }
}
