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
        Schema::create('archived_certificates', function (Blueprint $table) {
            $table->id();
            $table->string('user_id'); // Foreign key to reference users table
            $table->string('certificate_name');
            $table->date('issued_date')->nullable();
            $table->date('expiring_date')->nullable();
            $table->string('certificate_file_path'); // Adjusted for naming consistency
            $table->string('status');
            $table->string('type')->default('expirable');
            $table->string('category')->nullable();
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('user_id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archived_certificates');
    }
};
