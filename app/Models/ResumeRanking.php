<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResumeRanking extends Model
{
    use HasFactory;

    protected $table = 'resume_rankings';

    public function openPosition()
    {
        return $this->belongsTo(Position::class, 'position_id');
    }

    protected $fillable = [
        
        'filename',
        'file_path', 
        'email',
        'position_name',
        'name',
        'percentage',
    ];
}
