<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use Illuminate\Http\Request;
use App\Models\Tag;
use Illuminate\Support\Facades\Log;
use App\Models\SuggestedTag;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;




class AdminTagsController extends Controller
{
    public function storeTag(Request $request)
    {
        $position = $request->input('position');
        $tag = $request->input('tag');

        Log::info('Storing tag for position: ' . $position, ['tag' => $tag]);

        try {
            $tagRecord = Tag::firstOrCreate(['position' => $position], ['tag' => '']);
            $existingTags = explode(',', $tagRecord->tag);
            if (!in_array($tag, $existingTags)) {
                $existingTags[] = $tag;
                $tagRecord->update([
                    'tag' => implode(',', array_filter($existingTags))
                ]);
                Log::info('Tag added successfully for position: ' . $position);
                return response()->json(['message' => 'Tag added successfully', 'tags' => $existingTags]);
            } else {
                return response()->json(['message' => 'Tag already exists', 'tags' => $existingTags]);
            }
        } catch (\Exception $e) {
            Log::error('Error adding tag for position: ' . $position, ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error adding tag'], 500);
        }
    }

    public function getTagsByPosition($position)
    {
        $tagRecord = Tag::where('position', $position)->first();
        if ($tagRecord) {
            $tags = explode(',', $tagRecord->tag);
            return response()->json(['tags' => array_filter($tags)]);
        } else {
            return response()->json(['tags' => []]);
        }
    }

    public function removeTag(Request $request)
    {
        $position = $request->input('position');
        $tagToRemove = $request->input('tag');

        Log::info('Removing tag for position: ' . $position, ['tag' => $tagToRemove]);

        try {
            $tagRecord = Tag::where('position', $position)->first();
            if ($tagRecord) {
                $existingTags = explode(',', $tagRecord->tag);
                $updatedTags = array_diff($existingTags, [$tagToRemove]);
                $tagRecord->update([
                    'tag' => implode(',', array_filter($updatedTags))
                ]);
                Log::info('Tag removed successfully for position: ' . $position);
                return response()->json(['message' => 'Tag removed successfully', 'tags' => array_values($updatedTags)]);
            } else {
                return response()->json(['message' => 'No tags found for this position'], 404);
            }
        } catch (\Exception $e) {
            Log::error('Error removing tag for position: ' . $position, ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error removing tag'], 500);
        }
    }

    public function suggestTag(Request $request)
    {
        try {
            $user = Auth::user();

            // Check if user is authenticated
            if (!$user) {
                Log::warning('Unauthenticated tag suggestion attempt', [
                    'input' => $request->all(),
                    'headers' => $request->headers->all()
                ]);
                return response()->json([
                    'message' => 'Unauthorized - Please login first'
                ], 401);
            }

            Log::info('Tag suggestion request received', [
                'input' => $request->all(),
                'user_id' => $user->id,
                'headers' => $request->headers->all()
            ]);

            $position = $request->input('position');
            $tag = $request->input('tag');

            DB::beginTransaction();

            // Insert the tag suggestion and get the ID
            $suggestedTagId = DB::table('suggested_tags')->insertGetId([
                'position' => $position,
                'tag' => $tag,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Create admin notification with null-safe operator
            $notification = AdminNotification::create([
                'type' => 'tag_suggestion',
                'notifiable_id' => $suggestedTagId,
                'notifiable_type' => SuggestedTag::class,
                'user_id' => $user->id, // Store the user ID
                'message' => "New tag '{$tag}' has been suggested for position: {$position}. From: {$user->name}",
                'data' => json_encode([
                    'tag_name' => $tag,
                    'position' => $position,
                    'status' => 'pending',
                    'requester_name' => $user->name,
                    'requester_id' => $user->id,
                    'suggested_tag_id' => $suggestedTagId,
                    'suggested_at' => now()->toDateTimeString()
                ]),
                'isRead' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::commit();

            Log::info('Tag suggestion process completed successfully', [
                'user_id' => $user->id,
                'suggested_tag_id' => $suggestedTagId
            ]);

            return response()->json(['message' => 'Tag suggestion submitted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error in tag suggestion process', [
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'position' => $position ?? null,
                'tag' => $tag ?? null,
                'user_id' => Auth::id() // Safer way to get user ID
            ]);

            return response()->json([
                'message' => 'Error suggesting tag',
                'debug_message' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function getSuggestedTags()
    {
        $suggestedTags = SuggestedTag::where('status', 'pending')->get();
        return response()->json(['suggestedTags' => $suggestedTags]);
    }

    public function reviewSuggestedTag(Request $request)
    {
        $id = $request->input('id');
        $action = $request->input('action'); // 'approve' or 'decline'

        try {
            $suggestedTag = SuggestedTag::findOrFail($id);

            if ($action === 'approve') {
                $tagRecord = Tag::firstOrCreate(
                    ['position' => $suggestedTag->position],
                    ['tag' => '']
                );

                $existingTags = explode(',', $tagRecord->tag);
                if (!in_array($suggestedTag->tag, $existingTags)) {
                    $existingTags[] = $suggestedTag->tag;
                    $tagRecord->update([
                        'tag' => implode(',', array_filter($existingTags))
                    ]);
                }

                $suggestedTag->delete();
                return response()->json(['message' => 'Tag approved and added successfully']);
            } elseif ($action === 'decline') {
                $suggestedTag->delete();
                return response()->json(['message' => 'Tag suggestion declined']);
            }
        } catch (\Exception $e) {
            Log::error('Error reviewing suggested tag', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error reviewing suggested tag'], 500);
        }
    }
}
