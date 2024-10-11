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
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->string("user_id");
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->decimal('hourly_rate', 8, 2)->default(0.00); // Hourly rate of employee
            $table->integer('working_hours')->default(0.00); // Total hours worked for the pay period
            $table->decimal('tax', 5, 2)->default(0.00)->nullable(); // Tax percentage (e.g., 10.00 means 10%)
            $table->decimal('deductions', 10, 2)->default(0)->nullable(); // Any deductions
            $table->decimal('gross_salary', 10, 2)->nullable(); // Calculated gross salary
            $table->decimal('net_salary', 10, 2)->nullable(); // Calculated net salary

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
