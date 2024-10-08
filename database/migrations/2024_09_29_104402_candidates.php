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
        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->time('time')->nullable();
            $table->date("date")->nullable();
            $table->string('hr_name')->nullable();
            $table->string('position')->nullable();
            $table->string('job_position')->nullable();
            $table->string('recruitment_stage')->default('Application');
            $table->string('onboarding_token')->nullable();
            $table->string('onboarding_status')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hired_candidates');
    }
};
