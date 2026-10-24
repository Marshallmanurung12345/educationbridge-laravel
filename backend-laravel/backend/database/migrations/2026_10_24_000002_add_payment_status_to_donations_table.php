<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->string('payment_status', 20)->default('pending')->after('payment_method');
            $table->string('order_id', 50)->nullable()->unique()->after('payment_status');
            $table->string('midtrans_transaction_id')->nullable()->after('order_id');
        });

        DB::table('donations')->update(['payment_status' => 'unverified']);
        DB::table('campaigns')->update(['raised_amount' => 0]);
    }

    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropUnique(['order_id']);
            $table->dropColumn(['payment_status', 'order_id', 'midtrans_transaction_id']);
        });
    }
};
