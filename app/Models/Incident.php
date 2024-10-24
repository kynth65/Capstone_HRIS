<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    use HasFactory;

    protected $table = 'incidents';

    protected $fillable = [
        'user_id',
        'reported_employee_ids',
        'title',
        'description',
        'status',
        'incident_date',
        'severity',
        'name',
        'file_path'
    ];

    protected $casts = [
        'reported_employee_ids' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reportedEmployees()
    {
        return $this->belongsToMany(User::class, 'user_id', 'reported_employee_ids');
    }

    public function reportedIncidents()
    {
        return $this->hasMany(ReportedIncident::class);
    }

    public function complianceReports()
    {
        return $this->hasManyThrough(ComplianceReport::class, ReportedIncident::class);
    }
}
