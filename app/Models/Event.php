<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Event extends Model
{
    protected $fillable = [
        'title',
        'type',
        'icon',
        'event_date',
        'audience',
        'with_person',
        'is_active',
        'created_by'
    ];

    protected $casts = [
        'event_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    // Event types
    public const TYPES = [
        'meeting' => 'Meeting',
        'party' => 'Party',
        'birthday' => 'Birthday',
        'anniversary' => 'Anniversary',
        'other' => 'Other'
    ];

    // Audience types
    public const AUDIENCES = [
        'all_team' => 'All Team',
        'specific_department' => 'Specific Department',
        'specific_people' => 'Specific People'
    ];

    // Icon mappings
    public const ICONS = [
        'meeting' => '🏢',
        'party' => '🎉',
        'birthday' => '🎂',
        'anniversary' => '🎊',
        'other' => '📅'
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
