<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('npsn')->unique();
            $table->string('name');
            $table->string('jenjang'); // SD, SMP, SMA, SMK, etc.
            $table->string('status_sekolah'); // NEGERI, SWASTA
            $table->string('provinsi');
            $table->string('kabupaten_kota');
            $table->string('kecamatan');
            $table->text('alamat')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->unsignedInteger('jumlah_siswa')->nullable();
            $table->unsignedInteger('jumlah_guru')->nullable();
            $table->json('fasilitas')->nullable();
            $table->boolean('is_3t')->default(false);
            $table->string('status_3t_detail')->nullable();
            $table->string('data_source')->default('Data Induk Pendidikan Kemendikdasmen');
            $table->string('source_url')->default('https://data.kemendikdasmen.go.id/data-induk');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};