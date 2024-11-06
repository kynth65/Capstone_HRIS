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
        'user_id',
        'archived_at',
        'archived_by'  // Add this to fillable
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_active' => 'boolean',
        'archived_at' => 'datetime'  // Add this cast
    ];

    public function employeeDocuments()
    {
        return $this->hasMany(EmployeeDocument::class);
    }

    // Add relationship for archived_by
    public function archivedByUser()
    {
        return $this->belongsTo(User::class, 'archived_by', 'id');
    }
}
