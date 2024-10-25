<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PasswordResetController extends Controller
{
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'personal_email' => 'required|email|exists:users,personal_email',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Personal email does not exist'], 422);
        }

        $token = Str::random(60);

        DB::table('password_resets')->insert([
            'personal_email' => $request->personal_email,
            'token' => Hash::make($token),
            'created_at' => Carbon::now()
        ]);

        Mail::send('emails.password-reset', [
            'token' => $token,
            'personal_email' => $request->personal_email
        ], function ($message) use ($request) {
            $message->to($request->personal_email);
            $message->subject('Reset Your Password');
        });

        return response()->json(['message' => 'Reset password link has been sent to your personal email']);
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'personal_email' => 'required|email|exists:users,personal_email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Password and confirm password do not match'], 422);
        }

        $user = User::where('personal_email', $request->personal_email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Password reset successful']);
    }
}
