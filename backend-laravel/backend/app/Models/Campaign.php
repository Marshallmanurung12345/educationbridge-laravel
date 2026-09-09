<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'school_name',
        'location',
        'category',
        'tags',
        'title',
        'description',
        'start_date',
        'end_date',
        'target_amount',
        'raised_amount',
        'student_count',
        'urgency',
        'facility_condition',
        'remoteness',
        'access_score',
        'image_url',
        'status',
        'priority_score',
    ];

    protected $casts = [
        'tags' => 'array',
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
    ];

    protected $appends = ['priority_label', 'progress_percent', 'priority_breakdown'];

    protected static function booted(): void
    {
        // Priority Score dihitung ulang otomatis setiap kali campaign disimpan,
        // supaya nilainya selalu konsisten dengan input terbaru.
        static::saving(function (Campaign $campaign) {
            $campaign->priority_score = static::computePriorityScore(
                (int) $campaign->urgency,
                (int) $campaign->facility_condition,
                (int) $campaign->remoteness,
                (int) $campaign->student_count,
                (int) $campaign->access_score,
            );
        });
    }

    /**
     * Priority Score (0-100):
     *  35% urgensi, 25% kondisi fasilitas (makin buruk makin tinggi skor),
     *  25% keterpencilan lokasi (3T), 15% jumlah siswa terdampak (dinormalisasi, cap 1000).
     */
    public static function computePriorityScore(int $urgency, int $facilityCondition, int $remoteness, int $studentCount, int $accessScore = 3): int
    {
        $regionScore = ($remoteness / 5) * 25;
        $facilityScore = ((6 - $facilityCondition) / 5) * 25;
        $studentScore = (min($studentCount, 1000) / 1000) * 20;
        $accessScore = (((6 - $accessScore) / 5) * 15);
        $urgencyScore = ($urgency / 5) * 15;

        return (int) round($regionScore + $facilityScore + $studentScore + $accessScore + $urgencyScore);
    }

    public function getPriorityBreakdownAttribute(): array
    {
        return [
            'wilayah_prioritas' => (int) round(((int) $this->remoteness / 5) * 25),
            'kondisi_fasilitas' => (int) round((((6 - (int) $this->facility_condition) / 5) * 25)),
            'siswa_terdampak' => (int) round((min((int) $this->student_count, 1000) / 1000) * 20),
            'akses_pendidikan' => (int) round((((6 - (int) $this->access_score) / 5) * 15)),
            'urgensi' => (int) round(((int) $this->urgency / 5) * 15),
        ];
    }

    public function getPriorityLabelAttribute(): string
    {
        return match (true) {
            $this->priority_score >= 80 => 'Sangat Prioritas',
            $this->priority_score >= 60 => 'Prioritas Tinggi',
            $this->priority_score >= 40 => 'Prioritas Sedang',
            default => 'Prioritas Standar',
        };
    }

    public function getProgressPercentAttribute(): int
    {
        if ($this->target_amount <= 0) {
            return 0;
        }

        return (int) min(100, round(($this->raised_amount / $this->target_amount) * 100));
    }

    public function school()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}
