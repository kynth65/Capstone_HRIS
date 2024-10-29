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
  .announcement {
    background-color: #f8f9fa;
    padding: 20px;
    margin: 20px 0;
    border-left: 4px solid #4285f4;
    border-radius: 4px;
  }
  .highlight {
    color: #4285f4;
    font-weight: bold;
  }
  .message-section {
    background-color: #ffffff;
    padding: 20px;
    margin: 15px 0;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    line-height: 1.8;
  }
  .contact-info {
    background-color: #e8f0fe;
    padding: 15px 20px;
    margin: 20px 0;
    border-radius: 4px;
    color: #1a73e8;
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
      
      <div class="announcement">
        We are thrilled to announce that you have successfully completed your probationary period and are now officially a <span class="highlight">Regular Employee</span> with us at <strong>GammaCare Medical Services Inc.</strong>!
      </div>
      
      <div class="message-section">
        <p>
          This is a significant milestone, and it reflects your hard work, commitment, and the positive impact you've made on our team. We are grateful to have you on board and look forward to seeing your continued contributions.
        </p>
      </div>
      
      <div class="contact-info">
        <p>
          Please don't hesitate to reach out to your supervisor or the HR department should you have any questions as you transition into your new status.
        </p>
      </div>
      
      <p>
        Once again, congratulations, and welcome to the GammaCare family as a valued regular employee!
      </p>
      
      <div class="signature">
        Warmest regards,<br>
        Human Resources Team<br>
        <strong>GammaCare Medical Services Inc.</strong>
      </div>
    </div>
  </div>
</div>
</body>
</html>