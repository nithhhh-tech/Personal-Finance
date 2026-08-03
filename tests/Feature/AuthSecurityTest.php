<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_authenticated_user_without_email_verification(): void
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
        Notification::assertNothingSent();
    }

    public function test_unverified_user_can_access_finance_apis(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->getJson('/api/dashboard/summary')
            ->assertOk()
            ->assertJsonStructure(['current_balance', 'monthly_income', 'monthly_expense']);
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
