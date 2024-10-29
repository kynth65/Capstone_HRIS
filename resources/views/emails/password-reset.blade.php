<!DOCTYPE html>
<html>
<head>
<style>
  .outer-container {
    background-color: #f5f5f5;
    padding: 40px 20px;
  }
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
    color: #333333;
    line-height: 1.6;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  .header {
    padding: 20px 30px;
    border-bottom: 2px solid #4285f4;
    margin-bottom: 24px;
    background-color: #fafafa;
  }
  .security-icon {
    text-align: center;
    font-size: 48px;
    margin: 20px 0;
  }
  .content {
    padding: 0 30px 30px 30px;
    text-align: center;
  }
  .title {
    font-size: 24px;
    color: #202124;
    margin-bottom: 20px;
    font-weight: bold;
  }
  .reset-button {
    display: inline-block;
    background-color: #4285f4;
    color: white;
    padding: 15px 30px;
    text-decoration: none;
    border-radius: 4px;
    margin: 25px 0;
    font-weight: bold;
  }
  .reset-button:hover {
    background-color: #3367d6;
  }
  .warning {
    background-color: #feefe3;
    padding: 15px;
    margin: 20px 0;
    border-radius: 4px;
    border-left: 4px solid #f6b26b;
    text-align: left;
    font-size: 14px;
    color: #666;
  }
  .expires-info {
    background-color: #f8f9fa;
    padding: 15px;
    margin: 20px 0;
    border-radius: 4px;
    font-size: 14px;
    color: #666;
  }
  .footer {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e0e0e0;
    color: #666666;
    font-size: 12px;
    text-align: center;
  }
  @media screen and (max-width: 600px) {
    .outer-container {
      padding: 20px 10px;
    }
    .email-container {
      border-radius: 0;
    }
    .content {
      padding: 0 20px 20px 20px;
    }
  }
</style>
</head>
<body>
<div class="outer-container">
  <div class="email-container">
    <div class="header">
      <div class="security-icon">
        🔒
      </div>
    </div>
    
    <div class="content">
      <div class="title">
        Reset Your Password
      </div>
      
      <p>
        We received a request to reset your password for your GammaCare Medical Services Inc. account.
      </p>
      
      <a href="{{ url('http://localhost:5173/reset-password?token=' . $token .  '&personal_email=' . urlencode($personal_email)) }}" class="reset-button">
        Reset Password
      </a>
      
      <div class="expires-info">
        This password reset link will expire in 60 minutes.
      </div>
      
      <div class="warning">
        <strong>⚠️ Important:</strong> If you did not request a password reset, please ignore this email or contact support if you have concerns about your account security.
      </div>
      
      <div class="footer">
        This email was sent by GammaCare Medical Services Inc.<br>
        Please do not reply to this email.
      </div>
    </div>
  </div>
</div>
</body>
</html>