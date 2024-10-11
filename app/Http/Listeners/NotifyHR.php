<?php

namespace App\Listeners;

use App\Events\UserTimedOut;
use App\Models\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotifyHR implements ShouldQueue
{
    public function handle(UserTimedOut $event)
    {
        // Create a notification for HR
        Notification::create([
            'message' => $event->user->name . ' has timed out.',
        ]);
    }
}
