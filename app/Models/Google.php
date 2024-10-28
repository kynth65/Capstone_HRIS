<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Google extends Model
{
    protected $table = 'googles';
    protected $fillable = [
        'google_id',
        'google_name',
        'google_email',
        'has_upload'
    ];
    protected $casts = [
        'has_uploaded' => 'boolean'
    ];

    // Relationship with ResumeRanking if needed
    public function resumeRankings()
    {
        return $this->hasMany(ResumeRanking::class, 'email', 'google_email');
    }
}
