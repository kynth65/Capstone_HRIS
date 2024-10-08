<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('archived_employees', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('name');
            $table->string('email')->unique();
            $table->string('contact_number');
            $table->string('gender');
            $table->string('position');
            $table->string('password');
            $table->string('profile')->nullable();
            $table->text('address')->nullable();
            $table->decimal('salary', 10, 2)->nullable();
            $table->integer('leave')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archived_employees');
    }
};
