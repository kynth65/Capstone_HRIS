<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'users';

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($user) {
            if (!$user->user_id) {
                $user->user_id = self::generateUserId();
            }
        });
        static::saving(function ($user) {
            $user->name = trim(implode(' ', array_filter([
                $user->first_name ?? '',
                $user->middle_name ?? '',
                $user->last_name ?? ''
            ])));
        });
    }

    public static function generateUserId()
    {
        $year = date('Y');
        $randomNumber = rand(1000, 9999);
        return '0' . $year . $randomNumber;
    }

    protected $fillable = [
        "user_id",
        'rfid',
        'name',
        'email',
        'password',
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'date_of_birth',
        'gender',
        'marital_status',
        'nationality',
        'mothers_maiden_name',
        'fathers_name',
        'address',
        'city',
        'province',
        'postal_code',
        'country',
        'personal_email',
        'work_email',
        'home_phone',
        'contact_number',
        'emergency_contact_name',
        'emergency_contact_relationship',
        'emergency_contact_phone',
        'hire_date',
        'employment_status',
        'position',
        'department',
        'reporting_manager',
        'work_location',
        'employee_type',
        'probationary_end_date',
        'current_salary',
        'pay_frequency',
        'highest_degree_earned',
        'field_of_study',
        'institution_name',
        'graduation_year',
        'work_history',
        'health_insurance_plan',
        'sick_leave_balance',
        'completed_training_programs',
        'work_permit_expiry_date',
        'profile',
        'notes',
        'schedule',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function getNameAttribute()
    {
        if (!$this->attributes['name']) {
            return trim(implode(' ', array_filter([$this->first_name, $this->middle_name, $this->last_name])));
        }
        return $this->attributes['name'];
    }

    public function getAgeAttribute()
    {
        return \Carbon\Carbon::parse($this->date_of_birth)->age;
    }

    public function payrolls(): HasMany
    {
        return $this->hasMany(Payroll::class, 'user_id', 'user_id');
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    public function certificateUpdateRequests()
    {
        return $this->hasMany(CertificateUpdateRequest::class, 'user_id', 'user_id');
    }

    public function reviewedRequests()
    {
        return $this->hasMany(CertificateUpdateRequest::class, 'reviewed_by', 'user_id');
    }
    public function archivedCertificates()
    {
        return $this->hasMany(ArchivedCertificate::class, 'user_id', 'user_id');
    }
}
