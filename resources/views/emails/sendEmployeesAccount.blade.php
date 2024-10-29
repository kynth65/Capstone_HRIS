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
    font-size: 40px;
    margin: 10px 0;
  }
  .content {
    padding: 0 30px 30px 30px;
  }
  .welcome-message {
    font-size: 22px;
    color: #202124;
    margin-bottom: 20px;
  }
  .credentials-box {
    background-color: #f8f9fa;
    padding: 20px;
    margin: 20px 0;
    border-left: 4px solid #4285f4;
    border-radius: 4px;
  }
  .credential-item {
    margin: 10px 0;
  }
  .credential-label {
    color: #4285f4;
    font-weight: bold;
    display: inline-block;
    width: 100px;
  }
  .warning-message {
    background-color: #feefe3;
    padding: 15px;
    margin: 20px 0;
    border-radius: 4px;
    border-left: 4px solid #f6b26b;
    color: #e65100;
  }
  .footer {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e0e0e0;
    color: #666666;
    text-align: center;
    font-size: 14px;
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
        🔐
      </div>
    </div>
    
    <div class="content">
      <div class="welcome-message">
        Hello,
      </div>
      
      <p>Your account has been successfully created. Here are your credentials:</p>
      
      <div class="credentials-box">
        <div class="credential-item">
          <span class="credential-label">Email:</span>
          <span>{{ $email }}</span>
        </div>
        <div class="credential-item">
          <span class="credential-label">Password:</span>
          <span>{{ $password }}</span>
        </div>
      </div>
      
      <div class="warning-message">
        <strong>⚠️ Important Security Notice:</strong>
        <p style="margin: 10px 0 0 0">Please log in and change your password immediately for security purposes.</p>
      </div>
      
      <div class="footer">
        <p>This is an automated message from GammaCare Medical Services Inc.<br>
        Please do not reply to this email.</p>
        
        <p>If you did not request this account, please contact support immediately.</p>
      </div>
    </div>
  </div>
</div>
</body>
</html>