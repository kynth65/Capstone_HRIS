<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('archived_employees', function (Blueprint $table) {
            // Adding all missing columns with same types as users table
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('middle_name')->nullable()->after('last_name');
            $table->date('date_of_birth')->nullable()->after('middle_name');
            $table->enum('marital_status', ['Single', 'Married', 'Divorced', 'Widowed'])->nullable();
            $table->string('nationality')->nullable();
            $table->string('mothers_maiden_name')->nullable();
            $table->string('fathers_name')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->nullable();
            $table->string('personal_email')->nullable();
            $table->string('work_email')->nullable();
            $table->string('home_phone')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->date('hire_date')->nullable();
            $table->enum('employment_status', ['Full-time', 'Part-time', 'Contract'])->nullable();
            $table->string('department')->nullable();
            $table->string('reporting_manager')->nullable();
            $table->string('work_location')->nullable();
            $table->enum('employee_type', ['Regular', 'Temporary', 'Intern'])->nullable();
            $table->date('probation_end_date')->nullable();
            $table->decimal('current_salary', 10, 2)->nullable();
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
            $table->text('notes')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('schedule')->nullable();
            $table->string('remember_token', 100)->nullable();
        });
    }

    public function down()
    {
        Schema::table('archived_employees', function (Blueprint $table) {
            $table->dropColumn([
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
            ]);
        });
    }
};
