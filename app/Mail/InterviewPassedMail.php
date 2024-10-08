<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InterviewPassedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $candidate;

    public function __construct($candidate)
    {
        $this->candidate = $candidate;
    }

    public function build()
    {
        return $this->subject('Congratulations on Passing the Interview!')
            ->view('emails.interview_passed');
    }
}
