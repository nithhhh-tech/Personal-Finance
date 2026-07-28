<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BudgetTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_monthly_budget_with_progress(): void
    {
        [$user, $category] = $this->createBudgetSetup();
        $account = Account::create(['user_id' => $user->id, 'name' => 'Cash', 'type' => 'cash', 'currency' => 'USD']);
        Transaction::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 25,
            'currency' => 'USD',
            'base_amount' => 25,
            'exchange_rate' => 1,
            'transaction_date' => '2026-07-10',
        ]);

        $this->actingAs($user)
            ->postJson('/api/budgets', [
                'category_id' => $category->id,
                'month' => '2026-07',
                'amount' => 100,
            ])
            ->assertCreated()
            ->assertJsonPath('category.id', $category->id)
            ->assertJsonPath('amount', '100.00')
            ->assertJsonPath('currency', 'USD')
            ->assertJsonPath('spent', '25.00')
            ->assertJsonPath('remaining', '75.00')
            ->assertJsonPath('progress_percent', 25);
    }

    public function test_user_cannot_budget_income_category_or_another_users_category(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $incomeCategory = Category::create(['user_id' => $user->id, 'name' => 'Salary', 'type' => 'income']);
        $otherCategory = Category::create(['user_id' => $otherUser->id, 'name' => 'Food', 'type' => 'expense']);

        $this->actingAs($user)
            ->postJson('/api/budgets', ['category_id' => $incomeCategory->id, 'month' => '2026-07', 'amount' => 100])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category_id']);

        $this->actingAs($user)
            ->postJson('/api/budgets', ['category_id' => $otherCategory->id, 'month' => '2026-07', 'amount' => 100])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category_id']);
    }

    public function test_index_returns_only_users_budgets_for_requested_month(): void
    {
        [$user, $category] = $this->createBudgetSetup();
        [$otherUser, $otherCategory] = $this->createBudgetSetup();
        Budget::create(['user_id' => $user->id, 'category_id' => $category->id, 'month' => '2026-07-01', 'amount' => 100, 'currency' => 'USD']);
        Budget::create(['user_id' => $user->id, 'category_id' => $category->id, 'month' => '2026-08-01', 'amount' => 200, 'currency' => 'USD']);
        Budget::create(['user_id' => $otherUser->id, 'category_id' => $otherCategory->id, 'month' => '2026-07-01', 'amount' => 300, 'currency' => 'USD']);

        $this->actingAs($user)
            ->getJson('/api/budgets?month=2026-07')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.amount', '100.00');
    }

    public function test_user_can_delete_budget(): void
    {
        [$user, $category] = $this->createBudgetSetup();
        $budget = Budget::create(['user_id' => $user->id, 'category_id' => $category->id, 'month' => '2026-07-01', 'amount' => 100, 'currency' => 'USD']);

        $this->actingAs($user)
            ->deleteJson("/api/budgets/{$budget->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('budgets', ['id' => $budget->id]);
    }

    private function createBudgetSetup(): array
    {
        $user = User::factory()->create(['base_currency' => 'USD']);
        $category = Category::create(['user_id' => $user->id, 'name' => 'Food', 'type' => 'expense', 'color' => '#f97316']);

        return [$user, $category];
    }
}
