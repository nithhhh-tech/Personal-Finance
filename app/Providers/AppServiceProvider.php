<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        VerifyEmail::createUrlUsing(function ($notifiable) {
            return URL::temporarySignedRoute(
                'verification.verify',
                Carbon::now()->addMinutes(config('auth.verification.expire', 60)),
                [
                    'id' => $notifiable->getKey(),
                    'hash' => sha1($notifiable->getEmailForVerification()),
                ]
            );
        });

        VerifyEmail::toMailUsing(function ($notifiable, string $verificationUrl) {
            return (new MailMessage)
                ->subject('Verify your PocketLedger email')
                ->view('emails.action', [
                    'preheader' => 'Verify your email to unlock your PocketLedger tracker.',
                    'eyebrow' => 'Verify email',
                    'title' => 'Secure your money tracker',
                    'body' => 'Click the button below to verify your email address and open your private finance dashboard.',
                    'actionText' => 'Verify email address',
                    'actionUrl' => $verificationUrl,
                    'note' => 'If you did not create a PocketLedger account, you can safely ignore this email.',
                ]);
        });

        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            return url('/?reset_token='.$token.'&email='.urlencode($notifiable->getEmailForPasswordReset()));
        });

        ResetPassword::toMailUsing(function ($notifiable, string $token) {
            $resetUrl = url('/?reset_token='.$token.'&email='.urlencode($notifiable->getEmailForPasswordReset()));

            return (new MailMessage)
                ->subject('Reset your PocketLedger password')
                ->view('emails.action', [
                    'preheader' => 'Reset your PocketLedger password securely.',
                    'eyebrow' => 'Password reset',
                    'title' => 'Create a new password',
                    'body' => 'We received a request to reset your password. Use the button below to choose a new one.',
                    'actionText' => 'Reset password',
                    'actionUrl' => $resetUrl,
                    'note' => 'This reset link expires in '.config('auth.passwords.'.config('auth.defaults.passwords').'.expire').' minutes. If you did not request this, no action is needed.',
                ]);
        });
    }
}
