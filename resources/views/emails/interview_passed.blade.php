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
  .success-banner {
    background-color: #e6f4ea;
    color: #1e8e3e;
    padding: 20px;
    margin: 20px 0;
    border-left: 4px solid #1e8e3e;
    border-radius: 4px;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
  }
  .next-steps {
    background-color: #f8f9fa;
    padding: 20px;
    margin: 20px 0;
    border-radius: 4px;
    border-left: 4px solid #4285f4;
  }
  .celebration {
    font-size: 24px;
    text-align: center;
    margin: 20px 0;
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
      
      <div class="celebration">
        🎉 Congratulations! 🎉
      </div>

      <div class="success-banner">
        You have successfully passed the interview!
      </div>
      
      <div class="next-steps">
        <p><strong>What happens next?</strong></p>
        <ul>
          <li>Our HR team will contact you shortly with detailed information</li>
          <li>We'll provide more information about your potential start date</li>
        </ul>
      </div>
      
      <p>
        We are excited about the possibility of you joining our team and look forward to moving forward with the process.
      </p>
      
      <div class="signature">
        Best regards,<br>
        Human Resources Team<br>
        <strong>GammaCare Medical Services Inc.</strong>
      </div>
    </div>
  </div>
</div>
</body>
</html>