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
        Schema::create('turnover_rates', function (Blueprint $table) {
            $table->id();
            $table->string("user_id");
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->string('name');
            $table->integer('involuntary');
            $table->integer('voluntary');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('turnover_rates');
    }
};
