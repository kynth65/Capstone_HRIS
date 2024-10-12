<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTrackingAttendanceTable extends Migration
{
    public function up()
    {
        Schema::create('tracking_attendance', function (Blueprint $table) {
            $table->id();
            $table->string('user_id'); // Assuming user_id is a string in your users table
            $table->date('date');
            $table->time('time_in')->nullable();
            $table->time('time_out')->nullable();
            $table->decimal('total_hours', 5, 2)->nullable(); // Total hours worked, e.g., 8.5 hours
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tracking_attendance');
    }
}
