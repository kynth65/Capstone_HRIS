<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeDocument extends Model
{
    protected $fillable = [
        'user_id',
        'requirement_id',
        'certificate_name',
        'issued_date',
        'expiring_date',
        'certificate_file_path',
        'status',
        'type',
        'category',
        'is_checked',
        'remarks'
    ];

    public function requirement()
    {
        return $this->belongsTo(Requirement::class);
    }
}
