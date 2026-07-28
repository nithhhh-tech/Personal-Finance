<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionOwnershipTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_create_transaction_with_another_users_account(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $otherAccount = Account::create([
            'user_id' => $otherUser->id,
            'name' => 'Other wallet',
            'type' => 'cash',
            'currency' => 'USD',
            'starting_balance' => 0,
            'current_balance' => 0,
        ]);
        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Food',
            'type' => 'expense',
            'color' => '#f97316',
        ]);

        $this->actingAs($user)
            ->postJson('/api/transactions', [
                'account_id' => $otherAccount->id,
                'category_id' => $category->id,
                'type' => 'expense',
                'amount' => 12,
                'currency' => 'USD',
                'exchange_rate' => 1,
                'transaction_date' => now()->toDateString(),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['account_id']);
    }

    public function test_user_cannot_create_transaction_with_another_users_category(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $account = Account::create([
            'user_id' => $user->id,
            'name' => 'Main wallet',
            'type' => 'cash',
            'currency' => 'USD',
            'starting_balance' => 0,
            'current_balance' => 0,
        ]);
        $otherCategory = Category::create([
            'user_id' => $otherUser->id,
            'name' => 'Other category',
            'type' => 'expense',
            'color' => '#f97316',
        ]);

        $this->actingAs($user)
            ->postJson('/api/transactions', [
                'account_id' => $account->id,
                'category_id' => $otherCategory->id,
                'type' => 'expense',
                'amount' => 12,
                'currency' => 'USD',
                'exchange_rate' => 1,
                'transaction_date' => now()->toDateString(),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category_id']);
    }
}
