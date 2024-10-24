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
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->string('user_id'); // Ensure this column exists
            $table->string('certificate_name'); // Ensure this column exists
            $table->date('issued_date')->nullable(); // Change to nullable if necessary
            $table->date('expiring_date')->nullable(); // Ensure this column exists
            $table->string('certificate_file_path'); // Ensure this column exists
            $table->string('status')->default('Active');
            $table->string('type')->default('expirable');
            $table->string('category')->nullable();
            $table->boolean('is_archived')->default(false);
            $table->boolean('can_update')->default(false);
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
