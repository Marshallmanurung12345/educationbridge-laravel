<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'campaign_id',
        'title',
        'narrative',
        'photo_url',
    ];

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }
}
