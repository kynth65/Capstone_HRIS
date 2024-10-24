<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Notification extends Model
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'type',
        'data',
        'notifiable_id',
        'notifiable_type',
        'read_at',
        'user_id',
        'message',
        'isRead',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'isRead' => 'boolean',
    ];

    public function notifiable()
    {
        return $this->morphTo();
    }
}
