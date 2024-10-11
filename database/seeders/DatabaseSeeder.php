<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'user_id' => '020241014',  // Add your desired user_id
            'rfid' => '1234567890',    // RFID number
            'name' => 'Test User',     // Full name
            'email' => 'admin@gmail.com',
            'password' => bcrypt('undercover12345'),  // Add a secure default password
            'first_name' => 'Test',
            'last_name' => 'User',
            'date_of_birth' => '1990-01-01',    // Example date of birth
            'gender' => 'Male',                // Adjust as needed
            'marital_status' => 'Single',      // Adjust as needed
            'hire_date' => '2022-01-01',       // Example hire date
            'employment_status' => 'Full-time',
            'position' => 'Admin',             // Admin position
            'department' => 'Admin',           // Admin department
            'employee_type' => 'Regular',
            'current_salary' => 50000.00,      // Example salary
            'sick_leave_balance' => 15,
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);
    }
}
