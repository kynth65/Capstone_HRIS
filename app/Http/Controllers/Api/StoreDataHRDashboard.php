<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\TurnoverRate;
use App\Models\EmployeeStatus;
use App\Models\Notification;

class StoreDataHRDashboard extends Controller
{
    public function storeData(Request $request)
    {
        // Store data in TurnoverRate
        TurnoverRate::create([
            'name' => $request->input('name'),
            'involuntary' => $request->input('involuntary'),
            'voluntary' => $request->input('voluntary'),
        ]);

        // Store data in EmploymentStatus
        EmployeeStatus::create([
            'name' => $request->input('name'),
            'full_time' => $request->input('full_time'),
            'part_time' => $request->input('part_time'),
            'student' => $request->input('student'),
        ]);

        // Store data in Notification
        Notification::create([
            'message' => $request->input('message'),
        ]);

        return response()->json(['message' => 'Data stored successfully']);
    }
}
