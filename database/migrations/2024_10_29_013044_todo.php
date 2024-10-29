<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('todos', function (Blueprint $table) {
            $table->id();
            $table->string('user_id');
            $table->string('text');
            $table->date('due_date')->nullable();
            $table->boolean('completed')->default(false);
            $table->timestamps();
            $table->index('user_id');
            $table->index('due_date');
        });
    }

    public function down()
    {
        Schema::dropIfExists('todos');
    }
};
