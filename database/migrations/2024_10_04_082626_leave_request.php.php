<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->string('user_id');
            $table->string('file_name');
            $table->date('start_date');  // Added start date
            $table->date('end_date');    // Added end date
            $table->integer('days_requested')->default(0);  // Added days calculation
            $table->string('statuses');
            $table->string('file_path');
            $table->timestamps();

            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};
