<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tag;
use Illuminate\Support\Facades\Log;

class AdminTagsController extends Controller
{
    public function storeTags(Request $request)
    {
        $position = $request->input('position');
        $tags = $request->input('tags');

        // Log the incoming request
        Log::info('Storing tags for position: ' . $position, ['tags' => $tags]);

        try {
            // Retrieve the existing tags for the position (if any)
            $existingTagRecord = Tag::where('position', $position)->first();

            if ($existingTagRecord) {
                // Append the new tags to the existing ones, making sure there are no duplicates
                $existingTags = explode(',', $existingTagRecord->tag);
                $mergedTags = array_unique(array_merge($existingTags, $tags));

                // Update the tags in the database
                $existingTagRecord->update([
                    'tag' => implode(',', $mergedTags)
                ]);

                Log::info('Tags updated successfully for position: ' . $position);
            } else {
                // Create a new record for the position if it doesn't exist
                Tag::create([
                    'position' => $position,
                    'tag' => implode(',', $tags) // Store tags as a comma-separated string
                ]);

                Log::info('Tags saved successfully for new position: ' . $position);
            }

            return response()->json(['message' => 'Tags saved successfully']);
        } catch (\Exception $e) {
            Log::error('Error saving tags for position: ' . $position, ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error saving tags'], 500);
        }
    }

    public function getTagsByPosition($position)
    {
        $tagRecord = Tag::where('position', $position)->first();
        if ($tagRecord) {
            $tags = explode(',', $tagRecord->tag); // Convert the string back to an array
            return response()->json(['tags' => $tags]);
        } else {
            return response()->json(['tags' => []]);
        }
    }
}
