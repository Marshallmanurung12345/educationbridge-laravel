<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('account_status', 32)->default('verified')->after('role')->index();
            $table->text('verification_note')->nullable()->after('account_status');
        });

        DB::table('users')
            ->where('role', 'sekolah')
            ->update(['account_status' => 'verified']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['account_status']);
            $table->dropColumn(['account_status', 'verification_note']);
        });
    }
};
