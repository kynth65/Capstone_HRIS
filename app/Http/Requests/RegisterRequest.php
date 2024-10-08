<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'rfid' => 'required|string|unique:users,rfid',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'suffix' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', Password::min(8)->letters()->numbers()],
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:Male,Female,Other',
            'marital_status' => 'nullable|in:Single,Married,Divorced,Widowed',
            'nationality' => 'nullable|string|max:255',
            'mothers_maiden_name' => 'nullable|string|max:255',
            'fathers_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:255',
            'personal_email' => 'nullable|email',
            'work_email' => 'nullable|email',
            'home_phone' => 'nullable|string|max:20',
            'contact_number' => 'required|string|max:20',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_relationship' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'hire_date' => 'required|date',
            'employment_status' => 'required|in:Full-time,Part-time,Contract',
            'position' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'reporting_manager' => 'nullable|string|max:255',
            'work_location' => 'nullable|string|max:255',
            'employee_type' => 'required|in:Regular,Temporary,Intern',
            'probation_end_date' => 'nullable|date',
            'current_salary' => 'required|numeric|min:0',
            'pay_frequency' => 'nullable|in:Weekly,Bi-weekly,Monthly',
            'highest_degree_earned' => 'nullable|string|max:255',
            'field_of_study' => 'nullable|string|max:255',
            'institution_name' => 'nullable|string|max:255',
            'graduation_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 10),
            'work_history' => 'nullable|string',
            'health_insurance_plan' => 'nullable|string|max:255',
            'sick_leave_balance' => 'nullable|integer|min:0',
            'completed_training_programs' => 'nullable|string',
            'work_permit_expiry_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ];
    }
}
