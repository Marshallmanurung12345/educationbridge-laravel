<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    use HasFactory;

    protected $fillable = [
        'npsn',
        'name',
        'jenjang',
        'status_sekolah',
        'provinsi',
        'kabupaten_kota',
        'kecamatan',
        'alamat',
        'latitude',
        'longitude',
        'jumlah_siswa',
        'jumlah_guru',
        'fasilitas',
        'is_3t',
        'status_3t_detail',
        'data_source',
        'source_url',
    ];

    protected $casts = [
        'fasilitas' => 'array',
        'is_3t' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
        'jumlah_siswa' => 'integer',
        'jumlah_guru' => 'integer',
    ];

    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}