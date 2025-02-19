<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\LogoutRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Events\UserTimedOut;
use App\Models\Notification;
use App\Http\Controllers\AttendanceController;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Http\Resources\UserResource;
use App\Mail\SendEmployeeAccount;
use App\Models\RfidCard;
use Illuminate\Support\Facades\Storage;



class AuthController extends Controller
{
    protected $attendanceController;

    // Inject AttendanceController
    //public function __construct(AttendanceController $attendanceController)
    // {
    //    $this->attendanceController = $attendanceController;
    //}

    public function login(LoginRequest $request)
    {
        $data = $request->validated();

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'Email or password is incorrect!'
            ], 401);
        }
        /** @var User $user */
        $token = $user->createToken('auth_token')->plainTextToken;

        $cookie = cookie('token', $token, 60 * 24); // 1 day

        return response()->json([
            'user' => $user,
            'token' => $token,
        ])->withCookie($cookie);

        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function register(RegisterRequest $request)
    {
        Log::info('Register Request: ', $request->all());

        $data = $request->validated();

        try {

            $rfidCard = RfidCard::where('rfid_uid', $data['rfid'])
                ->where('status', 'available')
                ->first();

            $rfidCard->status = 'assigned';
            $rfidCard->save();

            // Combine first and last name
            // Combine first and last name
            $fullName = trim($data['first_name'] . ' ' . ($data['middle_name'] ?? '') . ' ' . $data['last_name']);

            // Only create fields based on requiredFields list
            // Only create fields based on requiredFields list
            $user = User::create([
                'rfid' => $data['rfid'],
                'name' => $fullName,
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'department' => $data['department'],
                'department' => $data['department'],
                'employment_status' => $data['employment_status'],
                'personal_email' =>  $data['personal_email'],
                'employee_type' =>  $data['employee_type'],
                'position' => $data['position'],
                'hire_date' => $data['hire_date'],
                'reporting_manager' =>  $data['reporting_manager'],
                'department' => $data['department'],
                'gender' => $data['gender'],
                'contact_number' =>  $data['contact_number'],
                'pay_frequency' =>  $data['pay_frequency'],
                'probation_end_date' =>  $data['probation_end_date'],
                'email' => $data['email'],
                'password' => bcrypt($data['password']),
                'schedule' =>  $data['schedule'],
            ]);

            // Create token for the user
            $token = $user->createToken('auth_token')->plainTextToken;

            // Set token as a cookie
            $cookie = cookie('token', $token, 60 * 24); // token valid for 1 day

            // Return response with token and user resource
            // Set token as a cookie
            $cookie = cookie('token', $token, 60 * 24); // token valid for 1 day
            Mail::to($data['personal_email'])->send(new SendEmployeeAccount($data['email'], $data['password']));
            // Return response with token and user resource
            return response()->json([
                'user' => $user,
                'token' => $token
            ])->withCookie($cookie);
        } catch (\Exception $e) {
            Log::error('Registration failed: ' . $e->getMessage());
            return response()->json([
                'error' => 'Registration failed. Please try again.',
                'exception' => $e->getMessage()
            ], 500);
            return response()->json([
                'error' => 'Registration failed. Please try again.',
                'exception' => $e->getMessage()
            ], 500);
        }
    }

    public function completeProfile(Request $request)
    {
        $user = User::where('user_id', $request->user_id)->first();
        if (!$user) {
            return response()->json([
                'message' => 'User not found',
                'received_user_id' => $request->user_id
            ], 404);
        }

        $request->validate([
            'user_id' => 'required|exists:users,user_id',
            'date_of_birth' => 'required|date',
            'marital_status' => 'required|string',
            'nationality' => 'required|string',
            'mothers_maiden_name' => 'required|string',
            'fathers_name' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'province' => 'required|string',
            'postal_code' => 'required|string',
            'country' => 'required|string',
            // 'personal_email' => 'required|email',
            // 'work_email' => 'required|email',
            'home_phone' => 'required|string',
            'emergency_contact_name' => 'required|string',
            'emergency_contact_relationship' => 'required|string',
            'emergency_contact_phone' => 'required|string',
            'work_location' => 'required|string',
            'highest_degree_earned' => 'required|string',
            'field_of_study' => 'required|string',
            'institution_name' => 'required|string',
            'graduation_year' => 'required|integer',
            'work_history' => 'required|string',
            'health_insurance_plan' => 'required|string',
            'completed_training_programs' => 'required|string',
            // 'profile' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:204800',
            'notes' => 'required|string',
        ]);

        // Use fill to mass assign all the fields
        $user->fill($request->except('profile'));

        if ($request->hasFile('profile')) {
            // Delete old image if it exists
            if ($user->profile) {
                Storage::disk('public')->delete('images/' . $user->profile);
            }

            $file = $request->file('profile');
            $originalName = $file->getClientOriginalName();
            $filename = time() . $originalName;

            // Store in the images directory
            $imagePath = $file->storeAs('images', $filename, 'public');

            // Save only the filename, not the full path
            $user->profile = $filename;  // This will store just the filename without 'images/'
        }

        // Save user
        $user->save();

        // Generate new token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Profile completed successfully',
            'token' => $token,
            'user' => $user
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email not found!'], 404);
        }

        // Generate reset token and store it in the database
        $token = Str::random(60);
        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => $token,
            'created_at' => now(),
        ]);

        // Send email with reset link
        $resetLink = url('/reset-password?token=' . $token);
        Mail::send([], [], function ($message) use ($request, $resetLink) {
            $message->to($request->email)
                ->subject('Password Reset Request')
                ->setBody('Click here to reset your password: ' . $resetLink);
        });

        return response()->json(['message' => 'Reset password link sent!'], 200);
    }

    // Step 2: Reset Password
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        $passwordReset = DB::table('password_reset_tokens')->where('token', $request->token)->first();

        if (!$passwordReset) {
            return response()->json(['message' => 'Invalid token!'], 400);
        }

        $user = User::where('email', $passwordReset->email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found!'], 404);
        }

        // Update the user's password
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete the token after successful password reset
        DB::table('password_reset_tokens')->where('token', $request->token)->delete();

        return response()->json(['message' => 'Password has been reset!'], 200);
    }



    public function logout(LogoutRequest $request)
    {
        $request->user()->currentAccessToken()->delete();

        $cookie = cookie()->forget('token');

        return response()->json([
            'message' => 'Logged out successfully!'
        ])->withCookie($cookie);
    }

    public function gettoken()
    {

        return csrf_token();
    }

    public function refresh(Request $request)
    {
        try {
            /** @var User $user */
            $user = Auth::guard('sanctum')->user();

            if (!$user) {
                return response()->json([
                    'message' => 'Unauthenticated user'
                ], 401);
            }

            // Revoke current token
            $request->user()->currentAccessToken()->delete();

            // Create new token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Token refresh failed'
            ], 401);
        }
    }

    public function getEmployees()
    {
        $employees = User::all();
        return response()->json($employees);
    }

    public function Employees()
    {
        $employees = User::select("user_id", 'name')->get();
        return response()->json($employees);
    }


    public function getData()
    {
        // Retrieve and format turnover rates
        $turnoverRates = User::selectRaw('MONTH(created_at) as month, 
                                         COUNT(*) as total, 
                                         SUM(CASE WHEN role = "involuntary" THEN 1 ELSE 0 END) as involuntary, 
                                         SUM(CASE WHEN role = "voluntary" THEN 1 ELSE 0 END) as voluntary')
            ->groupBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->month,
                    'Involuntary' => $item->involuntary,
                    'Voluntary' => $item->voluntary,
                ];
            });

        // Retrieve and format employment statuses from the `users` table
        $employmentStatuses = User::selectRaw('employment_status, COUNT(*) as total')
            ->groupBy('employment_status')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->employment_status,
                    'FullTime' => $item->employment_status === 'FullTime' ? $item->total : 0,
                    'PartTime' => $item->employment_status === 'PartTime' ? $item->total : 0,
                    'Student' => $item->employment_status === 'Student' ? $item->total : 0,
                ];
            });

        // Fetch notifications from the `notifications` table using the Notification model
        $notifications = Notification::all();

        return response()->json([
            'employmentStatus' => $employmentStatuses,
            'notifications' => $notifications,
        ]);
    }
    public function getUsers()
    {
        // Fetch all users and return their name and other necessary fields
        $users = User::select('name')->get(); // Adjust the fields you need
        return response()->json($users);
    }
}
