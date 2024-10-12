<h1>Dear {{$candidate->name}},</h1>
<p>
We are pleased to inform you that you have been shortlisted for the {{$candidate->job_position}} position at <strong>Gamma Care Medical Services Inc.</strong>.
As the next step in our recruitment process, we would like to invite you to participate in an examination on {{ Carbon\Carbon::parse($candidate->date)->format('F j, Y') }} at {{ Carbon\Carbon::parse($candidate->time)->format('g:i A') }} at our office located at Amparo.

We look forward to meeting you and assessing your suitability for this role.</p>