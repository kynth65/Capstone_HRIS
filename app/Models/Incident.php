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
        'title',
        'description',
        'status',
        'incident_date',
        'severity',
        'name',
        'file_path'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
