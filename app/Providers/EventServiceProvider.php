<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\UserTimedOut;
use App\Listeners\NotifyHR;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        UserTimedOut::class => [
            NotifyHR::class,
        ],
    ];

    public function boot()
    {
        parent::boot();
    }
}
