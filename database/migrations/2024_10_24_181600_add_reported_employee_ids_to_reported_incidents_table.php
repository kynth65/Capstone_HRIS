<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('reported_incidents', function (Blueprint $table) {
            // Adding JSON column for reported employee IDs
            $table->json('reported_employee_ids')->nullable()->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('reported_incidents', function (Blueprint $table) {
            $table->dropColumn('reported_employee_ids');
        });
    }
};