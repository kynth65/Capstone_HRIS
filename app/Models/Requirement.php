<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Requirement extends Model
{
    protected $fillable = [
        'name',
        'category',
        'type',
        'is_required',
        'is_active',
        'user_id'
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_active' => 'boolean'
    ];

    public function employeeDocuments()
    {
        return $this->hasMany(EmployeeDocument::class);
    }
}
