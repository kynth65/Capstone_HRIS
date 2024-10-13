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
        Schema::create('notifications', function (Blueprint $table) {
            // If 'id' is an integer and needs to be an auto-incrementing primary key
            $table->id(); // Equivalent to: $table->bigIncrements('id');

            // Define 'type' as a string
            $table->string('type')->nullable();

            // Define 'data' as longText with a collation
            $table->longText('data')->nullable();

            // Define 'notifiable_id' as an unsigned big integer
            $table->unsignedBigInteger('notifiable_id')->nullable();

            // Define 'notifiable_type' as a string
            $table->string('notifiable_type')->nullable();

            // Define 'read_at' as a nullable timestamp
            $table->timestamp('read_at')->nullable();

            // Define 'user_id' as a string
            $table->string('user_id')->nullable();

            // Define 'message' as a string
            $table->string('message')->nullable();

            // Define 'created_at' and 'updated_at' timestamps
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('notifications');
    }
};
