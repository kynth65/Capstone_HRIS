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
  .interview-details {
    background-color: #f8f9fa;
    padding: 20px;
    margin: 20px 0;
    border-left: 4px solid #4285f4;
    border-radius: 4px;
  }
  .interview-details strong {
    color: #4285f4;
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
      
      <p>
        We are pleased to invite you to the final interview for the <strong>{{$candidate->job_position}}</strong> position at GammaCare Medical Services Inc.
      </p>
      
      <div class="interview-details">
        <strong>Date:</strong> {{ Carbon\Carbon::parse($candidate->date)->format('F j, Y') }}<br>
        <strong>Time:</strong> {{ Carbon\Carbon::parse($candidate->time)->format('g:i A') }}
      </div>
      
      <p>
        We believe your skills and experience align well with the requirements of this role, and we are eager to learn more about your qualifications.
      </p>
      
      <p>
        Please let us know if you are available for this interview time.
      </p>
      
      <p>
        We look forward to speaking with you soon.
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