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
  .company-name {
    color: #4285f4;
    font-size: 24px;
    font-weight: bold;
  }
  .content {
    padding: 0 30px 30px 30px;
  }
  .candidate-name {
    font-size: 22px;
    color: #202124;
    margin-bottom: 20px;
  }
  .message {
    font-size: 16px;
    color: #202124;
    margin: 20px 0;
    line-height: 1.8;
  }
  .result-box {
    background-color: #f8f9fa;
    padding: 20px;
    margin: 20px 0;
    border-left: 4px solid #ea4335;
    border-radius: 4px;
  }
  .encouragement {
    background-color: #fafafa;
    padding: 20px;
    margin: 20px 0;
    border-radius: 4px;
    color: #666;
  }
  .signature {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e0e0e0;
    color: #666666;
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
      <span class="company-name">GammaCare Medical Services Inc.</span>
    </div>
    
    <div class="content">
      <div class="candidate-name">
        Dear {{$candidate->name}},
      </div>
      
      <div class="message">
        Thank you for participating in the examination process for GammaCare Medical Services Inc.
      </div>
      
      <div class="result-box">
        After careful evaluation of your examination results, we regret to inform you that you did not meet the required passing criteria for this position.
      </div>
      
      <div class="encouragement">
        We appreciate the time and effort you invested in the process. While this outcome wasn't what we hoped for, we encourage you to continue developing your skills and consider applying for future positions that align with your qualifications.
      </div>
      
      <p>
        Thank you for your interest in joining our team. We wish you the best in your future endeavors.
      </p>
      
      <div class="signature">
        Best regards,<br>
        Human Resources Team<br>
        GammaCare Medical Services Inc.
      </div>
    </div>
  </div>
</div>
</body>
</html>