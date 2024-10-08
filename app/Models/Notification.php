<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Notification extends Model
{
    protected $table = 'employee_notifications';

    use  HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['user_id, message'];
}
