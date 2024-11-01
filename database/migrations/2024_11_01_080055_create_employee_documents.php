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
        Schema::create('employee_documents', function (Blueprint $table) {
            $table->id();
            $table->string('user_id');
            $table->unsignedBigInteger('requirement_id');
            $table->string('certificate_name');
            $table->date('issued_date')->nullable();
            $table->date('expiring_date')->nullable();
            $table->string('certificate_file_path');
            $table->string('status')->default('Active');
            $table->string('type')->default('expirable');
            $table->string('category');
            $table->boolean('is_checked')->default(false);
            $table->string('remarks')->nullable();
            $table->timestamps();

            $table->foreign('requirement_id')->references('id')->on('requirements');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_documents');
    }
};
