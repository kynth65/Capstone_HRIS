<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('id', 36)->charset('utf8mb4')->collation('utf8mb4_unicode_ci')->change();
            $table->string('type')->nullable()->charset('utf8mb4')->collation('utf8mb4_unicode_ci')->change();
            $table->longText('data')->nullable()->charset('utf8mb4')->collation('utf8mb4_bin')->change();
            $table->unsignedBigInteger('notifiable_id')->nullable()->change();
            $table->string('notifiable_type')->nullable()->charset('utf8mb4')->collation('utf8mb4_unicode_ci')->change();
            $table->timestamp('read_at')->nullable()->change();
            $table->string('user_id')->nullable()->charset('utf8mb4')->collation('utf8mb4_unicode_ci')->change();
            $table->string('message')->nullable()->charset('utf8mb4')->collation('utf8mb4_unicode_ci')->change();
            $table->timestamp('created_at')->nullable()->default(null)->change();
            $table->timestamp('updated_at')->nullable()->default(null)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->bigIncrements('id')->change(); // Revert to bigIncrements if using auto-incrementing integers
            $table->string('type')->nullable(false)->charset('utf8mb4')->collation('utf8mb4_unicode_ci')->change();
            $table->text('data')->nullable(false)->charset('utf8mb4')->collation('utf8mb4_unicode_ci')->change();
            $table->unsignedBigInteger('notifiable_id')->nullable(false)->change();
            $table->string('notifiable_type')->nullable(false)->charset('utf8mb4')->collation('utf8mb4_unicode_ci')->change();
            $table->timestamp('read_at')->nullable(false)->change();
            $table->string('user_id')->nullable(false)->charset('utf8mb4')->collation('utf8mb4_unicode_ci')->change();
            $table->string('message')->nullable(false)->charset('utf8mb4')->collation('utf8mb4_unicode_ci')->change();
            $table->timestamp('created_at')->nullable(false)->default(DB::raw('CURRENT_TIMESTAMP'))->change();
            $table->timestamp('updated_at')->nullable(false)->default(DB::raw('CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP'))->change();
        });
    }
};
