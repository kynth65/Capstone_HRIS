<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('dashboard_attendances', function (Blueprint $table) {
            $table->id();
            $table->string('user_id');
            $table->timestamp('time_in')->nullable();
            $table->timestamp('time_out')->nullable();
            $table->date('date');
            $table->string('late')->nullable();
            $table->enum('status', ['present', 'absent', 'leave'])->default('present');
            $table->integer('accumulated_work_time')->default(0);
            $table->timestamps();

            $table->foreign('user_id')
                ->references('user_id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('dashboard_attendances');
    }
};
