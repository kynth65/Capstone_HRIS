<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Log;

class BroadcastServiceProvider extends ServiceProvider
{
  public function boot(): void
  {
    try {
      // Register routes with the correct middleware
      Broadcast::routes(['middleware' => ['auth:sanctum']]);

      require base_path('routes/channels.php');

      Log::info('Broadcasting service provider booted successfully');
    } catch (\Exception $e) {
      Log::error('Broadcasting service provider boot failed', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
    }
  }
}
