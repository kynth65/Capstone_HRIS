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
        Schema::table('requirements', function (Blueprint $table) {
            // Adding user_id column after id column
            $table->string('user_id')->nullable()->after('id');

            // If you want to add a foreign key constraint (optional)
            // $table->foreign('user_id')->references('user_id')->on('employees');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('requirements', function (Blueprint $table) {
            // If you added the foreign key constraint, remove it first
            // $table->dropForeign(['user_id']);

            $table->dropColumn('user_id');
        });
    }
};
