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
    display: inline-block;
    width: 85px;
  }
  .hr-info {
    background-color: #e8f0fe;
    padding: 15px;
    margin: 15px 0;
    border-radius: 4px;
    color: #1a73e8;
  }
  .response-buttons {
    text-align: center;
    margin: 25px 0;
  }
  .response-buttons a {
    display: inline-block;
    padding: 10px 30px;
    margin: 0 10px;
    text-decoration: none;
    border-radius: 4px;
    font-weight: bold;
  }
  .accept-button {
    background-color: #1e8e3e;
    color: white !important;
  }
  .decline-button {
    background-color: #ea4335;
    color: white !important;
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
    .response-buttons a {
      display: block;
      margin: 10px 0;
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
      
      <div class="hr-info">
        I hope this email finds you well. My name is {{ $candidate->hr_name }}, and I'm a {{ $candidate->position }} at GammaCare Medical Services Inc.
        I'm writing to invite you to an interview for the {{ $candidate->job_position }} position.
      </div>
      
      <p>
        We were impressed by your application and believe that your skills and experience align well with the requirements of this role.
      </p>
      
      <div class="interview-details">
        <strong>Date:</strong> {{ Carbon\Carbon::parse($candidate->date)->format('F j, Y') }}<br>
        <strong>Time:</strong> {{ Carbon\Carbon::parse($candidate->time)->format('g:i A') }}<br>
        <strong>Location:</strong> Amparo
      </div>
      
      <p>Please let me know if you are available for this interview time. If not, please suggest an alternative time that works best for you.</p>
      
      <div class="response-buttons">
        <a href="{{ route('interview.response', ['token' => $candidate->onboarding_token, 'response' => 'accept']) }}" class="accept-button">Accept</a>
        <a href="{{ route('interview.response', ['token' => $candidate->onboarding_token, 'response' => 'decline']) }}" class="decline-button">Decline</a>
      </div>
      
      <p>We look forward to hearing from you soon.</p>
      
      <div class="signature">
        Best regards,<br>
        {{ $candidate->hr_name }}<br>
        {{ $candidate->position }}<br>
        GammaCare Medical Services Inc.
      </div>
    </div>
  </div>
</div>
</body>
</html>