<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArchivedEmployee extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'name',
        'email',
        'password',
        'position',
        'gender',
        'contact_number',
        'leave',
        'address',
        'profile',
        'salary',
        'employee_type',
        'birthdate',
        'rfid',
        'is_archived',
    ];
}
