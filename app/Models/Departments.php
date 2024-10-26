<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departments extends Model
{
    // Specify the attributes that are mass assignable
    protected $fillable = ['name'];

    // Define a one-to-many relationship between Department and Position
    public function positions()
    {
        return $this->hasMany(AddPosition::class);
    }
}
