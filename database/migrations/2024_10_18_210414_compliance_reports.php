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
        Schema::create('compliance_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('incident_id');
            $table->string('user_id'); // Employee ID who needs to submit the report
            $table->text('report')->nullable(); // Compliance report content
            $table->string('file_path')->nullable(); // Optional file attachment
            $table->string('title')->nullable(); // Title of the incident
            $table->text('description')->nullable(); // Description of the incident
            $table->date('incident_date')->nullable(); // Date of the incident
            $table->enum('severity', ['low', 'medium', 'high'])->default('low'); // Severity of the incident
            $table->timestamps();

            $table->foreign('incident_id')->references('id')->on('incidents')->onDelete('cascade');
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
