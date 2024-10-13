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
        'mobileNumber',
        'question1_response',
        'question2_response',
        'question3_response',
        'question4_response',
        'question5_response',
        'question6_response',
        'question7_response',
        'question8_response',
        'question9_response',
        'question10_response',
    ];
}
