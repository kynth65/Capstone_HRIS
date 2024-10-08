<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class CertificateUpdateRequestStatus extends Notification implements ShouldQueue
{
    use Queueable;

    protected $certificate;
    protected $status;

    public function __construct($certificate, $status)
    {
        $this->certificate = $certificate;
        $this->status = $status; // 'approved' or 'rejected'
    }

    public function via($notifiable)
    {
        return ['mail', 'database']; // Notify via mail and database
    }

    public function toMail($notifiable)
    {
        $message = $this->status === 'approved'
            ? 'Your update request has been approved. You can now update your certificate.'
            : 'Your update request has been rejected.';

        return (new MailMessage)
            ->line($message)
            ->action('View Certificate', url("/certificates/{$this->certificate->id}/view"))
            ->line('Thank you for using our application!');
    }

    public function toArray($notifiable)
    {
        $message = $this->status === 'approved'
            ? "Your update request for certificate '{$this->certificate->certificate_name}' has been approved."
            : "Your update request for certificate '{$this->certificate->certificate_name}' has been rejected.";

        return [
            'certificate_id' => $this->certificate->id,
            'message' => $message,
            'notifiable_id' => $notifiable->id, // Store the ID of the user who should receive the notification
            'notifiable_type' => get_class($notifiable),
        ];
    }
}
