<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('target_role')->nullable(); // 'admin', 'sekolah', 'individu', 'perusahaan', 'pemerintah'
            $table->string('type'); // 'campaign_submitted', 'campaign_verified', 'campaign_needs_revision', 'campaign_rejected', 'donation_received', 'report_created'
            $table->string('title');
            $table->text('message');
            $table->foreignId('campaign_id')->nullable()->constrained('campaigns')->cascadeOnDelete();
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};