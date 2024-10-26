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
        'selected_users',
        'selected_departments',
        'selected_positions',
        'is_active',
        'created_by'
    ];

    protected $casts = [
        'event_date' => 'datetime:Y-m-d H:i:s',
        'selected_users' => 'array',
        'selected_departments' => 'array',
        'selected_positions' => 'array'
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
        'specific_positions' => 'Specific Positions',
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

    public function selectedEmployees()
    {
        return $this->belongsToMany(User::class, 'event_users', 'event_id', 'user_id');
    }

    // Add relationship for selected departments
    public function selectedDepartments()
    {
        return $this->belongsToMany(Departments::class, 'event_departments', 'event_id', 'department_id');
    }

    // Add relationship for selected positions
    public function selectedPositions()
    {
        return $this->belongsToMany(AddPosition::class, 'event_positions', 'event_id', 'position_id');
    }
}
