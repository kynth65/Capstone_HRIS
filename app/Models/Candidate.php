<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'date',
        'time',
        'job_position',
        'recruitment_stage',
        'onboarding_token',
        'onboarding_status',
        'hr_name',
        'position'
    ];
}
