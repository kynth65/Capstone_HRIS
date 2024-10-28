<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

Broadcast::channel('private-chat.{userId}', function ($user, $userId) {
  Log::info('Attempting to authenticate user:', ['user' => $user, 'requestedUserId' => $userId]);

  return $user->user_id === $userId;
});
