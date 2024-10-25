<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('incidents', function (Blueprint $table) {
            $table->text('delete_remarks')->nullable()->after('reported_employee_ids');
        });
    }

    public function down()
    {
        Schema::table('incidents', function (Blueprint $table) {
            $table->dropColumn('delete_remarks');
        });
    }
};
