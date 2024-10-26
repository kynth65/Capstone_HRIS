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
        Schema::table('archived_certificates', function (Blueprint $table) {
            // Drop foreign key constraint if it exists
            $table->dropForeign(['user_id']);

            // Optionally, make user_id nullable in the archived certificates table
            $table->string('user_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
