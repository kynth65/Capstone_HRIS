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
        Schema::table('compliance_reports', function (Blueprint $table) {
            // Add reported_incident_id column if it doesn't exist
            if (!Schema::hasColumn('compliance_reports', 'reported_incident_id')) {
                $table->unsignedBigInteger('reported_incident_id')->after('id')->nullable();

                // Add foreign key constraint
                $table->foreign('reported_incident_id')
                    ->references('id')
                    ->on('reported_incidents')
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
        Schema::table('compliance_reports', function (Blueprint $table) {
            // Remove foreign key first
            $table->dropForeign(['reported_incident_id']);
            // Then remove the column
            $table->dropColumn('reported_incident_id');
        });
    }
};
