<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_monthly_report_compares_selected_month_to_previous_month(): void
    {
        [$user, $account, $food, $salary] = $this->createReportSetup();
        $transport = Category::create(['user_id' => $user->id, 'name' => 'Transport', 'type' => 'expense']);

        $this->createTransaction($user, $account, $salary, 'income', 1000, '2026-07-05');
        $this->createTransaction($user, $account, $food, 'expense', 300, '2026-07-10');
        $this->createTransaction($user, $account, $transport, 'expense', 100, '2026-07-12');
        $this->createTransaction($user, $account, $salary, 'income', 800, '2026-06-05');
        $this->createTransaction($user, $account, $food, 'expense', 200, '2026-06-10');

        $this->actingAs($user)
            ->getJson('/api/reports/monthly?month=2026-07')
            ->assertOk()
            ->assertJsonPath('month', '2026-07')
            ->assertJsonPath('previous_month', '2026-06')
            ->assertJsonPath('current.income', 1000)
            ->assertJsonPath('current.expense', 400)
            ->assertJsonPath('current.savings', 600)
            ->assertJsonPath('previous.income', 800)
            ->assertJsonPath('previous.expense', 200)
            ->assertJsonPath('comparison.expense.amount', 200)
            ->assertJsonPath('comparison.expense.percent', 100)
            ->assertJsonCount(31, 'daily_trend')
            ->assertJsonCount(2, 'category_comparison');
    }

    public function test_monthly_report_does_not_include_other_users_transactions(): void
    {
        [$user, $account, $food] = $this->createReportSetup();
        [$otherUser, $otherAccount, $otherFood] = $this->createReportSetup();
        $this->createTransaction($user, $account, $food, 'expense', 50, '2026-07-10');
        $this->createTransaction($otherUser, $otherAccount, $otherFood, 'expense', 900, '2026-07-10');

        $this->actingAs($user)
            ->getJson('/api/reports/monthly?month=2026-07')
            ->assertOk()
            ->assertJsonPath('current.expense', 50)
            ->assertJsonCount(1, 'category_comparison');
    }

    private function createReportSetup(): array
    {
        $user = User::factory()->create(['base_currency' => 'USD']);
        $account = Account::create(['user_id' => $user->id, 'name' => 'Cash', 'type' => 'cash', 'currency' => 'USD']);
        $food = Category::create(['user_id' => $user->id, 'name' => 'Food', 'type' => 'expense']);
        $salary = Category::create(['user_id' => $user->id, 'name' => 'Salary', 'type' => 'income']);

        return [$user, $account, $food, $salary];
    }

    private function createTransaction(User $user, Account $account, Category $category, string $type, int $amount, string $date): void
    {
        Transaction::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => $type,
            'amount' => $amount,
            'currency' => 'USD',
            'base_amount' => $amount,
            'exchange_rate' => 1,
            'transaction_date' => $date,
        ]);
    }
}
