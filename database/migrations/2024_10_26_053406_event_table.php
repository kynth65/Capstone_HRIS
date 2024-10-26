<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('type'); // meeting, party, birthday, anniversary, etc.
            $table->string('icon')->nullable(); // For storing icon identifier
            $table->dateTime('event_date');
            $table->string('audience'); // all_team, specific_department, etc.
            $table->string('with_person')->nullable(); // For events with specific people
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
