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
        Schema::create('resume_rankings', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->string('filename'); // Filename of the resume
            $table->string('file_path');
            $table->float('percentage'); // Matching percentage
            $table->bigInteger('position_id')->unsigned(); // Foreign key column
            $table->float('score')->nullable(); // Score column added here
            $table->string('name');
            $table->string("email");
            $table->string("position_name");
            $table->text("matched_words");
            $table->text('comments');
            // Define the foreign key constraint
            $table->foreign('position_id')
                ->references('position_id')
                ->on('open_positions')
                ->onDelete('cascade'); // Cascade delete

            $table->timestamps(); // Created_at and updated_at timestamps
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resume_rankings');
    }
};
