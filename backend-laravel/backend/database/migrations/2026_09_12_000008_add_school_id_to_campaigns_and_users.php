<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('school_id')->nullable()->after('organization_name')->constrained('schools')->nullOnDelete();
            $table->string('npsn')->nullable()->after('school_id');
        });

        Schema::table('campaigns', function (Blueprint $table) {
            $table->foreignId('school_id')->nullable()->after('user_id')->constrained('schools')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropForeign(['school_id']);
            $table->dropColumn('school_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['school_id']);
            $table->dropColumn(['school_id', 'npsn']);
        });
    }
};