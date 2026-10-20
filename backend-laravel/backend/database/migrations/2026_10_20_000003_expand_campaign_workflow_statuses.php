<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->string('status', 32)->default('pending')->change();
        });
    }

    public function down(): void
    {
        DB::table('campaigns')
            ->where('status', 'needs_revision')
            ->update(['status' => 'pending']);
        DB::table('campaigns')
            ->where('status', 'completed')
            ->update(['status' => 'verified']);
        DB::table('campaigns')
            ->where('status', 'suspended')
            ->update(['status' => 'rejected']);

        Schema::table('campaigns', function (Blueprint $table) {
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending')->change();
        });
    }
};
