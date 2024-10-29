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
  .message-box {
    background-color: #f8f9fa;
    padding: 20px;
    margin: 20px 0;
    border-left: 4px solid #5f6368;
    border-radius: 4px;
  }
  .future-opportunities {
    background-color: #e8f0fe;
    padding: 20px;
    margin: 20px 0;
    border-radius: 4px;
    color: #1a73e8;
  }
  .feedback-section {
    background-color: #fafafa;
    padding: 20px;
    margin: 20px 0;
    border-radius: 4px;
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
        Dear {{ $candidate->name }},
      </div>
      
      <div class="message-box">
        Thank you for attending the interview and taking the time to meet with our team. After careful consideration, we regret to inform you that we have decided to proceed with other candidates at this time.
      </div>
      
      <div class="feedback-section">
        <p>While we were impressed with your qualifications and experience, we have chosen a candidate whose skills and experience more closely match our current needs.</p>
      </div>
      
      <div class="future-opportunities">
        <p>We encourage you to apply for future positions that match your qualifications. We will keep your application on file for any suitable openings that may arise in the next 6 months.</p>
      </div>
      
      <p>We wish you the best of success in your job search and future professional endeavors.</p>
      
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