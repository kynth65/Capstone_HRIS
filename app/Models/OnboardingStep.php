<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OnboardingStep extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'email'];

    public function onboardingSteps()
    {
        return $this->hasOne(OnboardingStep::class);
    }
}
