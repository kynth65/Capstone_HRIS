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
            'gender' => 'required',
            'contact_number' => 'required',
            'pay_frequency' => 'required',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', Password::min(8)->letters()->numbers()],
            'employment_status' => 'required|in:Full-time,Part-time,Contract',
            'employee_type' => 'required|in:Regular,Temporary,Intern',
            'position' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'hire_date' => 'required|date',
            'probation_end_date' => 'required|date',
            'reporting_manager' => 'required',
            'schedule' => 'required'

        ];
    }
}
