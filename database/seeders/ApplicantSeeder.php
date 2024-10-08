<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Applicant;

class ApplicantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Applicant::create([
            'first_name' => 'Chris',
            'last_name' => 'Glasser',
            'job_title' => 'Java Developer',
            'department' => 'Department of Information Technology',
            'location' => 'New York',
            'classification' => 'Full Time',
            'dob' => '1996-09-17',
            'hire_date' => '2023-07-12',
        ]);

        Applicant::create([
            'first_name' => 'Paula',
            'last_name' => 'Mora',
            'job_title' => 'HR Manager',
            'department' => 'Human Resources',
            'location' => 'California',
            'classification' => 'Full Time',
            'dob' => '1990-03-12',
            'hire_date' => '2022-01-15',
        ]);

        // Add more sample applicants as needed
    }
}
