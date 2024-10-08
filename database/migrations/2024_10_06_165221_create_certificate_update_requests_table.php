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
        Schema::create('certificate_update_requests', function (Blueprint $table) {
            $table->id();
            $table->string('user_id'); // Reference to the employee making the request
            $table->unsignedBigInteger('certificate_id'); // Reference to the certificate
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending'); // Status of the request
            $table->text('reason')->nullable(); // Reason for the request, optional
            $table->timestamp('requested_at')->useCurrent(); // Time of the request
            $table->string('reviewed_by')->nullable(); // User ID of the HR/Admin who reviewed it
            $table->timestamp('reviewed_at')->nullable(); // When the request was reviewed
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade'); // Employee who requested
            $table->foreign('certificate_id')->references('id')->on('certificates')->onDelete('cascade'); // Certificate being updated
            $table->foreign('reviewed_by')->references('user_id')->on('users')->onDelete('set null'); // HR/Admin who reviewed, nullable
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificate_update_requests');
    }
};
