<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_sends_email_verification_notification(): void
    {
        Notification::fake();

        $this->postJson('/api/register', [
            'name' => 'Nith',
            'email' => 'nith@example.com',
            'password' => 'password123',
            'base_currency' => 'USD',
        ])->assertCreated();

        $user = User::where('email', 'nith@example.com')->firstOrFail();

        $this->assertNull($user->email_verified_at);
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_unverified_user_cannot_access_finance_apis(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->getJson('/api/dashboard/summary')
            ->assertForbidden();
    }

    public function test_user_can_resend_verification_notification(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->postJson('/api/email/verification-notification')
            ->assertOk()
            ->assertJsonPath('message', 'Verification link sent.');

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_signed_verification_link_marks_email_as_verified(): void
    {
        $user = User::factory()->unverified()->create();
        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
            'id' => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
        ]);

        $this->get($url)->assertRedirect('/?email_verified=1');

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    public function test_password_reset_link_can_reset_password(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'nith@example.com']);

        $this->postJson('/api/forgot-password', ['email' => $user->email])
            ->assertOk();

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            $this->postJson('/api/reset-password', [
                'email' => $user->email,
                'token' => $notification->token,
                'password' => 'new-password123',
                'password_confirmation' => 'new-password123',
            ])->assertOk();

            return Hash::check('new-password123', $user->fresh()->password);
        });
    }
}
