<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionCurrencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_khr_transaction_is_converted_to_usd_base_amount(): void
    {
        $user = User::factory()->create(['base_currency' => 'USD']);
        $account = Account::create(['user_id' => $user->id, 'name' => 'Cash', 'type' => 'cash', 'currency' => 'USD']);
        $category = Category::create(['user_id' => $user->id, 'name' => 'Food', 'type' => 'expense']);

        $response = $this->actingAs($user)->postJson('/api/transactions', [
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 41000,
            'currency' => 'KHR',
            'exchange_rate' => 4100,
            'transaction_date' => now()->toDateString(),
        ]);

        $response->assertCreated()->assertJsonPath('base_amount', '10.00');
    }

    public function test_usd_transaction_is_converted_to_khr_base_amount(): void
    {
        $user = User::factory()->create(['base_currency' => 'KHR']);
        $account = Account::create(['user_id' => $user->id, 'name' => 'Cash', 'type' => 'cash', 'currency' => 'KHR']);
        $category = Category::create(['user_id' => $user->id, 'name' => 'Food', 'type' => 'expense']);

        $response = $this->actingAs($user)->postJson('/api/transactions', [
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 10,
            'currency' => 'USD',
            'exchange_rate' => 4100,
            'transaction_date' => now()->toDateString(),
        ]);

        $response->assertCreated()->assertJsonPath('base_amount', '41000.00');
    }
}
