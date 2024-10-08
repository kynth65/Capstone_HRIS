<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('employee_notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('user_id')->index(); // Change to string to match the users table
            $table->string('type')->nullable(); // Notification type
            $table->text('message'); // Notification message
            $table->timestamp('read_at')->nullable(); // Timestamp for when the notification was read
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('employee_notifications');
    }
};
