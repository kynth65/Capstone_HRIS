<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrackingAttendance extends Model
{
    use HasFactory;

    protected $table = 'tracking_attendance';

    protected $fillable = [
        'user_id',
        'date',
        'time_in',
        'time_out',
        'total_hours',
    ];

    // Defining relationships (optional based on your setup)
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
