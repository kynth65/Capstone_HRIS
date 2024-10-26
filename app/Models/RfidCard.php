<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RfidCard extends Model
{
    protected $fillable = [
        'rfid_uid',
        'status',
        'acknowledged'
    ];

    protected $casts = [
        'status' => 'string'
    ];

    // Scope to get available cards
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    // Scope to get assigned cards
    public function scopeAssigned($query)
    {
        return $query->where('status', 'assigned');
    }

    // Scope to get inactive cards
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }
}
