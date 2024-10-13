<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payroll extends Model
{
    protected $fillable = [
        'user_id',
        'hourlyRate',
        'working_hours',
        'tax',
        'deductions',
        'gross_salary',
        'net_salary',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }


    // Calculate gross salary
    public function calculateGrossSalary()
    {
        return $this->working_hours * $this->hourly_rate;
    }

    // Calculate net salary by applying deductions and tax
    public function calculateNetSalary()
    {
        $grossSalary = $this->calculateGrossSalary();
        $taxAmount = $grossSalary * ($this->tax / 100);
        return $grossSalary - $taxAmount - $this->deductions;
    }
}
