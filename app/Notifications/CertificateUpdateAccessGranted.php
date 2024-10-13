<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Certificate;

class CertificateUpdateAccessGranted extends Notification implements ShouldQueue
{
    use Queueable;

    protected $certificate;

    public function __construct(Certificate $certificate)
    {
        $this->certificate = $certificate;
    }

    public function via($notifiable)
    {
        return ['mail']; // You can add more channels like 'database', 'sms', etc.
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->line('You have been granted access to update your certificate.')
            ->action('Update Certificate', url("/certificates/{$this->certificate->id}/edit"))
            ->line('Thank you for using our application!');
    }

    public function toArray($notifiable)
    {
        return [
            'certificate_id' => $this->certificate->id,
            'message' => 'You have been granted access to update your certificate.'
        ];
    }
}
