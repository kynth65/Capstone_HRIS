<h1>Dear {{ $candidate->name }},</h1>

<p>
    I hope this email finds you well. My name is {{ $candidate->hr_name }}, and I'm a {{ $candidate->position }} at GammaCare Medical Services Inc.
    I'm writing to invite you to an interview for the {{ $candidate->job_position }} position.
</p>

<p>
    We were impressed by your application and believe that your skills and experience align well with the requirements of this role.
    The interview is scheduled for {{ Carbon\Carbon::parse($candidate->date)->format('F j, Y') }}, 
    at {{ Carbon\Carbon::parse($candidate->time)->format('g:i A') }}. It will take place at Amparo.
</p>

<p>Please let me know if you are available for this interview time. If not, please suggest an alternative time that works best for you.</p>

<p>
    <a href="{{ route('interview.response', ['token' => $candidate->onboarding_token, 'response' => 'accept']) }}">Accept</a> |
    <a href="{{ route('interview.response', ['token' => $candidate->onboarding_token, 'response' => 'decline']) }}">Decline</a>
</p>

<p>We look forward to hearing from you soon.</p>
