<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('archived_certificates', function (Blueprint $table) {
            // Add the 'can_update' column, defaulting to 0 (false)
            $table->boolean('can_update')->default(0)->after('is_archived');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('archived_certificates', function (Blueprint $table) {
            // Drop the 'can_update' column if the migration is rolled back
            $table->dropColumn('can_update');
        });
    }
};
