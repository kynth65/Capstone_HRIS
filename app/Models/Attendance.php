<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Attendance extends Model
{
    protected $fillable = ['user_id', 'rfid_id', 'time_in', 'position', 'time_out', 'date', 'status', 'accumulated_work_time'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function calculateWorkTime()
    {
        if ($this->time_in && $this->time_out) {
            $timeIn = Carbon::parse($this->time_in);
            $timeOut = Carbon::parse($this->time_out);
            return $timeIn->diffInMinutes($timeOut); // Returning minutes worked
        }
        return 0;
    }

    public static function updateAccumulatedTime($attendance)
    {
        $minutesWorked = $attendance->calculateWorkTime();
        $attendance->accumulated_work_time += $minutesWorked;
        $attendance->save();
    }
}
