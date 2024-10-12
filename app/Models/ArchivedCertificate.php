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
        'created_by',
        'updated_by',
        'is_archived',
    ];

    public $timestamps = true;

    // No relationships defined
}
