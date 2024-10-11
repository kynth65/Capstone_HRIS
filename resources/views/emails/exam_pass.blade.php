
<p>Dear {{$candidate->name}},
  You passed the exam!
  We are pleased to welcome you to GammaCare Medical Services Inc! As part of your onboarding process, we would like to invite you to our New Employee Orientation.
  This session is designed to help you get acquainted with our company, culture, and the tools and resources you'll need for success.
  Date: {{ Carbon\Carbon::parse($candidate->date)->format('F j, Y') }}
  Time: {{ Carbon\Carbon::parse($candidate->time)->format('g:i A') }}
  Location: [Location/Virtual Meeting Link]
  </p>
  