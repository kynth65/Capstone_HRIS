<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArchivedEmployee extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'contact_number',
        'gender',
        'position',
        'password',
        'profile',
        'address',
        'salary',
        'leave',
        'first_name',
        'last_name',
        'middle_name',
        'date_of_birth',
        'marital_status',
        'nationality',
        'mothers_maiden_name',
        'fathers_name',
        'city',
        'province',
        'postal_code',
        'country',
        'personal_email',
        'work_email',
        'home_phone',
        'emergency_contact_name',
        'emergency_contact_relationship',
        'emergency_contact_phone',
        'hire_date',
        'employment_status',
        'department',
        'reporting_manager',
        'work_location',
        'employee_type',
        'probation_end_date',
        'current_salary',
        'pay_frequency',
        'highest_degree_earned',
        'field_of_study',
        'institution_name',
        'graduation_year',
        'work_history',
        'health_insurance_plan',
        'sick_leave_balance',
        'suffix',
        'completed_training_programs',
        'work_permit_expiry_date',
        'notes',
        'email_verified_at',
        'schedule',
        'remember_token'
    ];

    protected $dates = [
        'date_of_birth',
        'hire_date',
        'probation_end_date',
        'work_permit_expiry_date',
        'email_verified_at',
        'created_at',
        'updated_at'
    ];
}
