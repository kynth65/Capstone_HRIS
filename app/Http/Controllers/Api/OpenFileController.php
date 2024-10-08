<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use App\Models\ResumeRanking;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class OpenFileController extends Controller
{
    /**
     * Retrieve the URL of the requested file.
     *
     * @param string $filename
     * @return \Illuminate\Http\JsonResponse
     */
    public function openFile($filename)
    {
        try {
            // Fetch the record for the given filename
            $resume = ResumeRanking::where('filename', $filename)->first();

            if ($resume) {
                // Check if file exists in the storage directory
                $filePath = storage_path("app/public/uploads/{$filename}");
                Log::info("File path checked: {$filePath}");

                if (file_exists($filePath)) {
                    // Return the URL of the file
                    return response()->json(['url' => asset("storage/uploads/{$filename}")]);
                } else {
                    // Log and return error if file is not found
                    Log::error("File not found: {$filePath}");
                    return response()->json(['message' => 'File not found'], Response::HTTP_NOT_FOUND);
                }
            } else {
                // Log and return error if no record is found
                Log::error("No record found in resume_ranking for filename: {$filename}");
                return response()->json(['message' => 'Record not found'], Response::HTTP_NOT_FOUND);
            }
        } catch (\Exception $e) {
            // Log and return error if an exception occurs
            Log::error("An error occurred while trying to open the file: {$filename}", [
                'exception' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'An error occurred while trying to open the file'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
