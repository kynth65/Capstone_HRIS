<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->string('user_id')->primary();
            $table->string('rfid');
            $table->string('name')->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['Male', 'Female', 'Other'])->nullable();
            $table->enum('marital_status', ['Single', 'Married', 'Divorced', 'Widowed'])->nullable();
            $table->string('nationality')->nullable();
            $table->string('mothers_maiden_name')->nullable();
            $table->string('fathers_name')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->nullable();
            $table->string('personal_email')->nullable();
            $table->string('work_email')->nullable();
            $table->string('home_phone')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->date('hire_date');
            $table->enum('employment_status', ['Full-time', 'Part-time', 'Contract']);
            $table->string('position');
            $table->string('department');
            $table->string('reporting_manager')->nullable();
            $table->string('work_location')->nullable();
            $table->enum('employee_type', ['Regular', 'Temporary', 'Intern']);
            $table->date('probation_end_date')->nullable();
            $table->decimal('current_salary', 10, 2)->default(0);
            $table->enum('pay_frequency', ['Weekly', 'Bi-weekly', 'Monthly'])->nullable();
            $table->string('highest_degree_earned')->nullable();
            $table->string('field_of_study')->nullable();
            $table->string('institution_name')->nullable();
            $table->year('graduation_year')->nullable();
            $table->text('work_history')->nullable();
            $table->string('health_insurance_plan')->nullable();
            $table->integer('sick_leave_balance')->default(15);
            $table->string('suffix')->nullable();
            $table->text('completed_training_programs')->nullable();
            $table->date('work_permit_expiry_date')->nullable();
            $table->string('profile', 300)->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('schedule');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
