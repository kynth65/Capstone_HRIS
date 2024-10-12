<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'certificate_name',
        'type',
        'category',
        'certificate_file_path',
        'issued_date',
        'expiring_date',
        'is_archived',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'issued_date' => 'date',
        'expiring_date' => 'date',
        'is_archived' => 'boolean',
    ];



    public function scopeArchived($query)
    {
        return $query->where('is_archived', true);
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function updateRequests()
    {
        return $this->hasMany(CertificateUpdateRequest::class, 'certificate_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
