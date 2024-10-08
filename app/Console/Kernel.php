<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
  /**
   * Define the application's command schedule.
   */
  protected function schedule(Schedule $schedule)
  {
    $schedule->call('App\Http\Controllers\AttendanceController@archiveDailyAttendance')
      ->dailyAt('23:59');  // Set the time you want this to run daily
  }

  /**
   * Register the commands for the application.
   */
  protected function commands()
  {
    $this->load(__DIR__ . '/Commands');
    require base_path('routes/console.php');
  }
}
