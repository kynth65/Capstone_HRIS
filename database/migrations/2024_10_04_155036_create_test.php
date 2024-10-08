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
        Schema::connection('mysql_second')->create('test', function (Blueprint $table) {
            $table->id(); // Equivalent to `id` Primary key, auto-incrementing
            $table->string('rfid', 50)->index(); // Equivalent to `rfid` with varchar(50) and indexed
            $table->string('name', 100); // Equivalent to `name` with varchar(100)
            $table->date('date'); // Equivalent to `date`
            $table->time('time_in'); // Equivalent to `time_in`
            $table->time('time_out')->nullable(); // Equivalent to `time_out`, nullable for initial entry
            $table->timestamps(); // Adds `created_at` and `updated_at` columns
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('test');
    }
};
