<h1>Reset Your Password</h1>
    <p>Click the link below to reset your password:</p>
    <a href="{{ url('http://localhost:5173/reset-password?token=' . $token .  '&email=' . urlencode($email)) }}">Reset Password</a>
    <p>If you did not request a password reset, please ignore this email.</p>