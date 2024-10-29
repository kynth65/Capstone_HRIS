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
  .thank-you-header {
    color: #4285f4;
    font-size: 28px;
    font-weight: bold;
    margin: 0;
  }
  .content {
    padding: 0 30px 30px 30px;
    text-align: center;
  }
  .message {
    font-size: 18px;
    color: #202124;
    margin: 20px 0;
    line-height: 1.8;
  }
  .signature {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e0e0e0;
    color: #666666;
  }
  /* Adding a subtle animation for the message */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .message {
    animation: fadeIn 0.8s ease-out;
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
      <h1 class="thank-you-header">Thank You!</h1>
    </div>
    
    <div class="content">
      <div class="message">
        Thank you for your time. We hope we can work together someday.
      </div>
      
      <div class="signature">
        Best regards,<br>
        GammaCare Medical Services Inc.
      </div>
    </div>
  </div>
</div>
</body>
</html>