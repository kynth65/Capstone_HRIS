<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->string('user_id');
            $table->string('name')->nullable();
            $table->string('title');
            $table->text('description');
            $table->enum('status', ['pending', 'investigating', 'resolved'])->default('pending');
            $table->date('incident_date');
            $table->enum('severity', ['low', 'medium', 'high'])->default('low');
            $table->string('file_path')->nullable(); // Optional PDF file path
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('incidents');
    }
};
