<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class AccountVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

   public function build()
    {
        // URL del frontend con query param ?token=...
        $verifyUrl = config('app.frontend_url') . '/verify-account?token=' . $this->user->verification_token;


        return $this->subject('Verifica tu cuenta 🚀')
                    ->view('emails.account_verification')
                    ->with(['user' => $this->user, 'verifyUrl' => $verifyUrl]);
    }
}
