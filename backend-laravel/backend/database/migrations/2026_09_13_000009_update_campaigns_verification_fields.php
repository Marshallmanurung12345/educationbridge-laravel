<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->text('rab_description')->nullable()->after('description');
            $table->string('supporting_document')->nullable()->after('rab_description');
            $table->text('verification_note')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn(['rab_description', 'supporting_document', 'verification_note']);
        });
    }
};