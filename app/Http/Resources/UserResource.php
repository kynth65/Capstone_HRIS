<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'rfid' => $this->rfid,
            'name' => $this->name,
            'email' => $this->email,
            'password' => $this->password,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'middle_name' => $this->middle_name,
            'suffix' => $this->suffix,
            'date_of_birth' => $this->date_of_birth,
            'gender' => $this->gender,
            'marital_status' => $this->marital_status,
            'nationality' => $this->nationality,
            'mothers_maiden_name' => $this->mothers_maiden_name,
            'fathers_name' => $this->fathers_name,
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'personal_email' => $this->personal_email,
            'work_email' => $this->work_email,
            'home_phone' => $this->home_phone,
            'contact_number' => $this->contact_number,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_relationship' => $this->emergency_contact_relationship,
            'emergency_contact_phone' => $this->emergency_contact_phone,
            'hire_date' => $this->hire_date,
            'employment_status' => $this->employment_status,
            'position' => $this->position,
            'department' => $this->department,
            'reporting_manager' => $this->reporting_manager,
            'work_location' => $this->work_location,
            'employee_type' => $this->employee_type,
            'probation_end_date' => $this->probation_end_date,
            'current_salary' => $this->current_salary,
            'pay_frequency' => $this->pay_frequency,
            'highest_degree_earned' => $this->highest_degree_earned,
            'field_of_study' => $this->field_of_study,
            'institution_name' => $this->institution_name,
            'graduation_year' => $this->graduation_year,
            'work_history' => $this->work_history,
            'health_insurance_plan' => $this->health_insurance_plan,
            'sick_leave_balance' => $this->sick_leave_balance,
            'completed_training_programs' => $this->completed_training_programs,
            'work_permit_expiry_date' => $this->work_permit_expiry_date,
            'profile' => $this->profile,
            'notes' => $this->notes,

        ];
    }
}
