<h1>Dear {{$candidate->name}},
</h1>
<p>

We are pleased to invite you to the final interview for the {{$candidate->job_position}} position at <strong>GammaCare Medical Services Inc.</strong>.

The interview will take place on  {{ Carbon\Carbon::parse($candidate->date)->format('F j, Y') }} at {{ Carbon\Carbon::parse($candidate->time)->format('g:i A') }}.

We believe your skills and experience align well with the requirements of this role, and we are eager to learn more about your qualifications.

Please let us know if you are available for this interview time.

We look forward to speaking with you soon.
</p>