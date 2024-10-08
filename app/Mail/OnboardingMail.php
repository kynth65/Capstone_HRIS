<?php

namespace App\Mail;

use App\Models\Candidate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OnboardingMail extends Mailable
{
    use Queueable, SerializesModels;

    public $candidate;

    public function __construct(Candidate $candidate)
    {
        $this->candidate = $candidate;
    }

    public function build()
    {
        return $this->view('emails.onboarding')
            ->subject('Candidate Interview')
            ->with(['candidate' => $this->candidate]);
    }
}
