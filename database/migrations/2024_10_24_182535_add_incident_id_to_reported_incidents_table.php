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
        Schema::table('reported_incidents', function (Blueprint $table) {
            // First check if the column doesn't already exist
            if (!Schema::hasColumn('reported_incidents', 'incident_id')) {
                // Add incident_id column
                $table->unsignedBigInteger('incident_id')->after('id')->nullable();

                // Add foreign key constraint
                $table->foreign('incident_id')
                    ->references('id')
                    ->on('incidents')
                    ->onDelete('cascade');
            }
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
            // Remove foreign key first
            $table->dropForeign(['incident_id']);
            // Then remove the column
            $table->dropColumn('incident_id');
        });
    }
};
