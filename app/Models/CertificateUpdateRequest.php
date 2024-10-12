<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Certificate;

class CertificateUpdateRequest extends Model
{
    use HasFactory;

    protected $table = 'certificate_update_requests';

    // The attributes that are mass assignable
    protected $fillable = [
        'user_id',
        'certificate_id',
        'status',
        'reason',
        'requested_at',
        'reviewed_by',
        'reviewed_at',
    ];

    // Relationship: CertificateUpdateRequest belongs to a User (employee making the request)
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    // Relationship: CertificateUpdateRequest belongs to a Certificate
    public function certificate()
    {
        return $this->belongsTo(Certificate::class, 'certificate_id');
    }

    // Relationship: CertificateUpdateRequest is reviewed by a User (HR/Admin)
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by', 'user_id');
    }
}
