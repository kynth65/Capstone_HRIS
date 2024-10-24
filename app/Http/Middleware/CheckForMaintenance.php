<?php

namespace App\Http\Middleware;

use Closure;

class CheckForMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if (app()->isDownForMaintenance()) {
            return response('Be right back!', 503);
        }

        return $next($request);
    }
}
