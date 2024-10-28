<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;


Route::get('/', function () {
    return view('welcome');
});

Route::get('/storage/{folder}/{filename}', function ($folder, $filename) {
    // Build the full path
    $path = storage_path("app/public/{$folder}/{$filename}");

    // Check if file exists
    if (!File::exists($path)) {
        abort(404);
    }

    try {
        // Get file content and mime type
        $file = File::get($path);
        $type = File::mimeType($path);

        // Return the file with proper headers
        $response = Response::make($file, 200);
        $response->header('Content-Type', $type);
        $response->header('Content-Disposition', 'inline');

        // Add cache control headers
        $response->header('Cache-Control', 'public, max-age=86400');
        $response->header('Expires', gmdate('D, d M Y H:i:s \G\M\T', time() + 86400));

        return $response;
    } catch (\Exception $e) {
        Log::error('File access error: ' . $e->getMessage());
        abort(500);
    }
});

Broadcast::routes(['middleware' => ['web', 'auth:sanctum']]);
