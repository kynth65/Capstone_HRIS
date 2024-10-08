<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    use HasFactory;


    protected $connection = "mysql_second";


    protected $fillable = [
        'rfid',
        'name',
        'date',
        'time_in',
        'time_out',
    ];

    protected $dates = [
        'date',
        'time_in',
        'time_out',
    ];
}
