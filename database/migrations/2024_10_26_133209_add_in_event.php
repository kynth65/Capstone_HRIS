<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Create event_users table
        Schema::create('event_users', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('event_id');
            $table->string('user_id');
            $table->timestamps();
        });

        // Create event_departments table
        Schema::create('event_departments', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('event_id');
            $table->bigInteger('department_id');
            $table->timestamps();
        });

        // Create event_positions table
        Schema::create('event_positions', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('event_id');
            $table->bigInteger('position_id');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('event_positions');
        Schema::dropIfExists('event_departments');
        Schema::dropIfExists('event_users');
    }
};
