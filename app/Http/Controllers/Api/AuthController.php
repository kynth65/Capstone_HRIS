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
            'user' => new UserResource($user),
            'token' => $token,
        ])->withCookie($cookie);

        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function register(RegisterRequest $request)
    {
        Log::info('Register Request: ', $request->all());

        $data = $request->validated();

        try {
            $fullName = trim($data['first_name'] . ' ' . ($data['middle_name'] ?? '') . ' ' . $data['last_name']);

            $user = User::create([
                'rfid' => $data['rfid'],
                'name' => $fullName,
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'suffix' => $data['suffix'] ?? null,
                'email' => $data['email'],
                'password' => bcrypt($data['password']),
                'date_of_birth' => $data['date_of_birth'],
                'gender' => $data['gender'],
                'marital_status' => $data['marital_status'] ?? null,
                'nationality' => $data['nationality'] ?? null,
                'mothers_maiden_name' => $data['mothers_maiden_name'] ?? null,
                'fathers_name' => $data['fathers_name'] ?? null,
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'province' => $data['province'] ?? null,
                'postal_code' => $data['postal_code'] ?? null,
                'country' => $data['country'] ?? null,
                'personal_email' => $data['personal_email'] ?? null,
                'work_email' => $data['work_email'] ?? null,
                'home_phone' => $data['home_phone'] ?? null,
                'contact_number' => $data['contact_number'] ?? null,
                'emergency_contact_name' => $data['emergency_contact_name'] ?? null,
                'emergency_contact_relationship' => $data['emergency_contact_relationship'] ?? null,
                'emergency_contact_phone' => $data['emergency_contact_phone'] ?? null,
                'hire_date' => $data['hire_date'],
                'employment_status' => $data['employment_status'],
                'position' => $data['position'],
                'department' => $data['department'],
                'reporting_manager' => $data['reporting_manager'] ?? null,
                'work_location' => $data['work_location'] ?? null,
                'employee_type' => $data['employee_type'],
                'probation_end_date' => $data['probation_end_date'] ?? null,
                'current_salary' => $data['current_salary'] ?? 0,
                'pay_frequency' => $data['pay_frequency'] ?? null,
                'highest_degree_earned' => $data['highest_degree_earned'] ?? null,
                'field_of_study' => $data['field_of_study'] ?? null,
                'institution_name' => $data['institution_name'] ?? null,
                'graduation_year' => $data['graduation_year'] ?? null,
                'work_history' => $data['work_history'] ?? null,
                'health_insurance_plan' => $data['health_insurance_plan'] ?? null,
                'sick_leave_balance' => $data['sick_leave_balance'] ?? 0,
                'completed_training_programs' => $data['completed_training_programs'] ?? null,
                'work_permit_expiry_date' => $data['work_permit_expiry_date'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);
            $token = $user->createToken('auth_token')->plainTextToken;

            $cookie = cookie('token', $token, 60 * 24);
            return response()->json([
                'user' => new UserResource($user),
                'token' => $token
            ])->withCookie($cookie);
        } catch (\Exception $e) {
            Log::error('Registration failed: ' . $e->getMessage());
            return response()->json(['error' => 'Registration failed. Please try again.', 'exception' => $e->getMessage()], 500);
        }
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
        /** @var \App\Models\User $user */
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Create a new access token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'accessToken' => $token,
        ]);
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
}
