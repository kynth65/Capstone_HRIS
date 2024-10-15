<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Applicant extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'job_title',
        'department',
        'location',
        'classification',
        'dob',
        'hire_date',
        'resume_path',
    ];

    protected $dates = ['dob', 'hire_date', 'created_at', 'updated_at'];
}
