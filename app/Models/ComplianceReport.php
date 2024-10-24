<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComplianceReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'reported_incident_id',
        'user_id',
        'report',
        'file_path',
    ];

    public function reportedIncident()
    {
        return $this->belongsTo(ReportedIncident::class, 'reported_incident_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
