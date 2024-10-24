<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('certificate_requests', function (Blueprint $table) {
            $table->id();
            $table->string('user_id');
            $table->string('certificate_name');
            $table->date('issued_date')->nullable();
            $table->date('expiring_date')->nullable();
            $table->string('certificate_file_path');
            $table->string('type')->default('expirable');
            $table->string('category')->nullable();
            $table->string('status')->default('pending');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('certificate_requests');
    }
};
