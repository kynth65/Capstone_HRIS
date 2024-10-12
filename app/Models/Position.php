<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Position extends Model
{
    use  HasApiTokens, HasFactory, Notifiable;
    protected $table = 'open_positions';
    protected $primaryKey = 'position_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = ['title', 'type', 'description', 'qualifications', 'hr_tags', 'base_salary'];

    public function resumeRankings()
    {
        return $this->hasMany(ResumeRanking::class, 'position_id');
    }
}
