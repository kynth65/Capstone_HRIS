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
        Schema::table('employee_notifications', function (Blueprint $table) {
            // Add new columns
            $table->json('data')->nullable()->after('message');
            $table->boolean('isRead')->default(false)->after('data');

            // Add new indices
            $table->index(['user_id', 'created_at']);
            $table->index('isRead');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('employee_notifications', function (Blueprint $table) {
            // Drop indices first
            $table->dropIndex(['user_id', 'created_at']);
            $table->dropIndex(['isRead']);

            // Drop columns
            $table->dropColumn('data');
            $table->dropColumn('isRead');
        });
    }
};
