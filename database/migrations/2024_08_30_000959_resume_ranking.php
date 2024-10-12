<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resume_rankings', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('file_path');
            $table->float('percentage');
            $table->unsignedBigInteger('position_id'); // Change this line
            $table->float('score')->nullable();
            $table->string('name');
            $table->string('email');
            $table->string('position_name');
            $table->text('matched_words');
            $table->text('comments');
            $table->string('mobileNumber', 15)->nullable();
            $table->text('question1_response')->nullable();
            $table->text('question2_response')->nullable();
            $table->text('question3_response')->nullable();
            $table->text('question4_response')->nullable();
            $table->text('question5_response')->nullable();
            $table->text('question6_response')->nullable();
            $table->text('question7_response')->nullable();
            $table->text('question8_response')->nullable();
            $table->text('question9_response')->nullable();
            $table->text('question10_response')->nullable();

            $table->foreign('position_id')
                ->references('position_id')
                ->on('open_positions')
                ->onDelete('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resume_rankings');
    }
};
