<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArchivedCertificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'certificate_name',
        'issued_date',
        'expiring_date',
        'certificate_file_path',
        'status',
        'type',
        'category',
        'is_archived',
        'can_update',
        'created_by',
        'updated_by',
    ];

    protected $attributes = [
        'status' => 'Active',
        'type' => 'expirable',
        'is_archived' => false,
        'can_update' => false,
    ];

    protected $casts = [
        'is_archived' => 'boolean',
        'can_update' => 'boolean',
        'issued_date' => 'date',
        'expiring_date' => 'date',
    ];

    public $timestamps = true;
}
