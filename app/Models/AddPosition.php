<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AddPosition extends Model
{
    protected $fillable = ['name', 'department_id'];
    protected $table = 'positions';

    // Define the relationship between Position and Department
    public function department()
    {
        return $this->belongsTo(Departments::class);
    }
}
