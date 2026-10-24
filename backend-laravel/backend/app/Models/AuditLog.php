<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'actor_id',
        'action',
        'subject_type',
        'subject_id',
        'old_values',
        'new_values',
        'note',
        'created_at',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (AuditLog $auditLog) {
            $auditLog->old_values = self::removeSensitiveValues($auditLog->old_values ?? []);
            $auditLog->new_values = self::removeSensitiveValues($auditLog->new_values ?? []);
            if ($auditLog->note !== null) {
                $auditLog->note = self::redactSensitiveText($auditLog->note);
            }
        });
    }

    private static function removeSensitiveValues(array $values): array
    {
        foreach ($values as $key => $value) {
            if (preg_match('/password|passwd|token|secret|credential|authorization|api[_-]?key/i', (string) $key)) {
                unset($values[$key]);
            } elseif (is_array($value)) {
                $values[$key] = self::removeSensitiveValues($value);
            } elseif (is_string($value)) {
                $values[$key] = self::redactSensitiveText($value);
            }
        }

        return $values;
    }

    private static function redactSensitiveText(string $text): string
    {
        return preg_replace(
            '/\b(password|passwd|token|secret|credential|authorization|api[_ -]?key)\b\s*[:=]\s*[^\s,;]+/i',
            '$1=[REDACTED]',
            $text,
        );
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
