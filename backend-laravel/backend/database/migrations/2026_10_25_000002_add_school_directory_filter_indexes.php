<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->index(['jenjang', 'provinsi', 'kabupaten_kota', 'name'], 'schools_directory_filter_index');
            $table->index(['provinsi', 'kabupaten_kota', 'name'], 'schools_location_filter_index');
        });
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropIndex('schools_directory_filter_index');
            $table->dropIndex('schools_location_filter_index');
        });
    }
};
