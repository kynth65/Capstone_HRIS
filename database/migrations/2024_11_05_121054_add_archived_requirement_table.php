<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('requirements', function (Blueprint $table) {
            $table->timestamp('archived_at')->nullable();
            // Store user ID without foreign key constraint
            $table->unsignedBigInteger('archived_by')->nullable();
        });
    }

    public function down()
    {
        Schema::table('requirements', function (Blueprint $table) {
            $table->dropColumn(['archived_at', 'archived_by']);
        });
    }
};
