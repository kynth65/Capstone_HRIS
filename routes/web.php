<?php

<<<<<<< HEAD
use Illuminate\Support\Facades\File;
=======
>>>>>>> ad0c86b088e06c1a4e3961b22261f96e15833819
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

<<<<<<< HEAD

Route::get('/storage/{folder}/{filename}', function ($folder, $filename) {
    $path = storage_path("app/public/{$folder}/{$filename}");

    if (!File::exists($path)) {
        abort(404);
    }

    $file = File::get($path);
    $type = File::mimeType($path);

    return response($file, 200)->header("Content-Type", $type);
});
=======
>>>>>>> ad0c86b088e06c1a4e3961b22261f96e15833819
