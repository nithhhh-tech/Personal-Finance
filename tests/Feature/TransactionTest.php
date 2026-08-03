<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_income_transaction_and_account_balance_is_recalculated(): void
    {
        [$user, $account, $category] = $this->createTransactionSetup('income', 25);

        $response = $this->actingAs($user)->postJson('/api/transactions', [
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'income',
            'amount' => 75,
            'currency' => 'USD',
            'transaction_date' => '2026-07-28',
            'payment_method' => 'Cash',
            'description' => 'Salary bonus',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('type', 'income')
            ->assertJsonPath('amount', '75.00')
            ->assertJsonPath('base_amount', '75.00')
            ->assertJsonPath('account.id', $account->id)
            ->assertJsonPath('category.id', $category->id);

        $this->assertSame('100.00', $account->fresh()->current_balance);
    }

    public function test_user_can_create_expense_transaction_and_account_balance_is_recalculated(): void
    {
        [$user, $account, $category] = $this->createTransactionSetup('expense', 100);

        $response = $this->actingAs($user)->postJson('/api/transactions', [
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 30,
            'currency' => 'USD',
            'transaction_date' => '2026-07-28',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('type', 'expense')
            ->assertJsonPath('base_amount', '30.00');

        $this->assertSame('70.00', $account->fresh()->current_balance);
    }

    public function test_user_only_sees_their_own_transactions_in_index(): void
    {
        [$user, $account, $category] = $this->createTransactionSetup('expense');
        [$otherUser, $otherAccount, $otherCategory] = $this->createTransactionSetup('expense');
        $ownTransaction = Transaction::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 10,
            'currency' => 'USD',
            'base_amount' => 10,
            'exchange_rate' => 1,
            'transaction_date' => '2026-07-28',
            'description' => 'Mine',
        ]);
        Transaction::create([
            'user_id' => $otherUser->id,
            'account_id' => $otherAccount->id,
            'category_id' => $otherCategory->id,
            'type' => 'expense',
            'amount' => 99,
            'currency' => 'USD',
            'base_amount' => 99,
            'exchange_rate' => 1,
            'transaction_date' => '2026-07-28',
            'description' => 'Not mine',
        ]);

        $this->actingAs($user)
            ->getJson('/api/transactions')
            ->assertOk()
            ->assertJsonPath('data.0.id', $ownTransaction->id)
            ->assertJsonCount(1, 'data');
    }

    public function test_index_filters_transactions_on_the_server(): void
    {
        [$user, $account, $expenseCategory] = $this->createTransactionSetup('expense');
        $incomeCategory = Category::create([
            'user_id' => $user->id,
            'name' => 'Salary',
            'type' => 'income',
            'color' => '#16a34a',
        ]);
        Transaction::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $expenseCategory->id,
            'type' => 'expense',
            'amount' => 12,
            'currency' => 'USD',
            'base_amount' => 12,
            'exchange_rate' => 1,
            'transaction_date' => '2026-07-28',
            'description' => 'Lunch',
        ]);
        Transaction::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $incomeCategory->id,
            'type' => 'income',
            'amount' => 100,
            'currency' => 'USD',
            'base_amount' => 100,
            'exchange_rate' => 1,
            'transaction_date' => '2026-07-28',
            'description' => 'Monthly pay',
        ]);

        $this->actingAs($user)
            ->getJson('/api/transactions?type=income&search=Salary')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', 'income')
            ->assertJsonPath('data.0.category.name', 'Salary');
    }

    public function test_index_returns_paginated_transaction_results(): void
    {
        [$user, $account, $category] = $this->createTransactionSetup('expense');

        foreach (range(1, 25) as $index) {
            Transaction::create([
                'user_id' => $user->id,
                'account_id' => $account->id,
                'category_id' => $category->id,
                'type' => 'expense',
                'amount' => $index,
                'currency' => 'USD',
                'base_amount' => $index,
                'exchange_rate' => 1,
                'transaction_date' => '2026-07-28',
                'description' => "Record {$index}",
            ]);
        }

        $this->actingAs($user)
            ->getJson('/api/transactions?page=2')
            ->assertOk()
            ->assertJsonPath('current_page', 2)
            ->assertJsonPath('per_page', 20)
            ->assertJsonPath('total', 25)
            ->assertJsonCount(5, 'data');
    }

    public function test_user_can_update_transaction_and_balance_is_recalculated(): void
    {
        [$user, $account, $category] = $this->createTransactionSetup('expense', 100);
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 20,
            'currency' => 'USD',
            'base_amount' => 20,
            'exchange_rate' => 1,
            'transaction_date' => '2026-07-28',
        ]);
        $this->recalculateAccount($account);

        $response = $this->actingAs($user)->putJson("/api/transactions/{$transaction->id}", [
            'amount' => 45,
            'description' => 'Updated spend',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('amount', '45.00')
            ->assertJsonPath('base_amount', '45.00')
            ->assertJsonPath('description', 'Updated spend');

        $this->assertSame('55.00', $account->fresh()->current_balance);
    }

    public function test_user_can_delete_transaction_and_balance_is_recalculated(): void
    {
        [$user, $account, $category] = $this->createTransactionSetup('expense', 100);
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 20,
            'currency' => 'USD',
            'base_amount' => 20,
            'exchange_rate' => 1,
            'transaction_date' => '2026-07-28',
        ]);
        $this->recalculateAccount($account);

        $this->actingAs($user)
            ->deleteJson("/api/transactions/{$transaction->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);
        $this->assertSame('100.00', $account->fresh()->current_balance);
    }

    private function createTransactionSetup(string $categoryType, int $startingBalance = 0): array
    {
        $user = User::factory()->create(['base_currency' => 'USD']);
        $account = Account::create([
            'user_id' => $user->id,
            'name' => 'Main wallet',
            'type' => 'cash',
            'currency' => 'USD',
            'starting_balance' => $startingBalance,
            'current_balance' => $startingBalance,
        ]);
        $category = Category::create([
            'user_id' => $user->id,
            'name' => $categoryType === 'income' ? 'Salary' : 'Food',
            'type' => $categoryType,
            'color' => '#d7a86e',
        ]);

        return [$user, $account, $category];
    }

    private function recalculateAccount(Account $account): void
    {
        $income = $account->transactions()->where('type', 'income')->sum('base_amount');
        $expense = $account->transactions()->where('type', 'expense')->sum('base_amount');
        $account->forceFill(['current_balance' => $account->starting_balance + $income - $expense])->save();
    }
}
