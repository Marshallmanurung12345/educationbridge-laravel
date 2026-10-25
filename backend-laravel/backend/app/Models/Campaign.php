<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'school_id',
        'school_npsn',
        'school_jenjang',
        'school_name',
        'location',
        'category',
        'tags',
        'title',
        'description',
        'rab_description',
        'supporting_document',
        'applicant_relationship',
        'verification_note',
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

    public static function isUploadedImagePath(?string $path): bool
    {
        return is_string($path) &&
            preg_match('/\Acampaign-uploads\/[A-Za-z0-9]{40}\.(?:jpg|jpeg|png|webp)\z/i', $path) === 1;
    }

    public function getImageUrlAttribute(): ?string
    {
        $value = $this->getRawOriginal('image_url');

        if (static::isUploadedImagePath($value)) {
            return url("/api/campaigns/{$this->id}/photo");
        }

        return $value;
    }

    public function getSupportingDocumentAttribute(): ?string
    {
        $value = $this->getRawOriginal('supporting_document');

        if (static::isUploadedImagePath($value)) {
            return url("/api/admin/campaigns/{$this->id}/proof");
        }

        return $value;
    }

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
     *  25% keterpencilan wilayah (3T), 25% kondisi fasilitas (makin buruk makin tinggi),
     *  20% jumlah siswa terdampak (dinormalisasi, cap 1000),
     *  15% akses pendidikan (makin rendah akses makin tinggi), 15% urgensi.
     */
    public static function computePriorityScore(int $urgency, int $facilityCondition, int $remoteness, int $studentCount, int $accessScore = 3): int
    {
        $regionScore = ($remoteness / 5) * 25;
        $facilityScore = ((6 - $facilityCondition) / 5) * 25;
        $studentScore = (min($studentCount, 1000) / 1000) * 20;
        // NB: jangan pakai nama variabel $accessScore lagi di sini, kalau tidak
        // parameter input akan tertimpa dan nilai asli dari user diabaikan.
        $accessPoint = ((6 - $accessScore) / 5) * 15;
        $urgencyScore = ($urgency / 5) * 15;

        return (int) round($regionScore + $facilityScore + $studentScore + $accessPoint + $urgencyScore);
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

    public function getProgressPercentAttribute(): float
    {
        if ($this->target_amount <= 0) {
            return 0;
        }

        return round(min(100, ($this->raised_amount / $this->target_amount) * 100), 1);
    }

    public function school()
    {
        return $this->belongsTo(School::class, 'school_id');
    }

    public function user()
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
