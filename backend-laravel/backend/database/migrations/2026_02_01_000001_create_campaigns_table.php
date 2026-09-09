<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // sekolah pengaju
            $table->string('school_name');
            $table->string('location');
            $table->string('category');
            $table->text('tags')->nullable(); // JSON-encoded array
            $table->string('title');
            $table->text('description');
            $table->unsignedBigInteger('target_amount');
            $table->unsignedBigInteger('raised_amount')->default(0);
            $table->unsignedInteger('student_count')->default(0);
            $table->unsignedTinyInteger('urgency')->default(3);
            $table->unsignedTinyInteger('facility_condition')->default(3);
            $table->unsignedTinyInteger('remoteness')->default(3);
            $table->string('image_url')->nullable();
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->unsignedTinyInteger('priority_score')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};
