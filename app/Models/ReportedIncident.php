<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportedIncident extends Model
{
    use HasFactory;

    protected $table = 'reported_incidents';

    protected $fillable = [
        'user_id',
        'incident_id',
        'name',
        'title',
        'description',
        'status',
        'incident_date',
        'severity',
        'file_path',
        'reported_employee_ids',
    ];

    protected $casts = [
        'reported_employee_ids' => 'array',
    ];

    public function incident()
    {
        return $this->belongsTo(Incident::class, 'incident_id');
    }

    public function complianceReports()
    {
        return $this->hasMany(ComplianceReport::class, 'reported_incident_id');
    }
}
