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
        Schema::table('archived_employees', function (Blueprint $table) {
            $table->string('password')->nullable(false)->change();
        });
    }

    public function down()
    {
        Schema::table('archived_employees', function (Blueprint $table) {
            $table->string('password')->nullable()->change();
        });
    }
};
