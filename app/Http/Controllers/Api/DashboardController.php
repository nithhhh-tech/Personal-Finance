<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function summary(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();
        $monthStart = Carbon::now()->startOfMonth();
        $monthEnd = Carbon::now()->endOfMonth();
        $transactions = $user->transactions();
        $budgets = $user->budgets()->whereDate('month', $monthStart)->get();
        $budgetCategoryIds = $budgets->pluck('category_id');
        $monthlyBudgetAmount = $budgets->sum('amount');
        $monthlyBudgetSpent = $budgetCategoryIds->isEmpty()
            ? 0
            : $user->transactions()
                ->where('type', 'expense')
                ->whereIn('category_id', $budgetCategoryIds)
                ->whereBetween('transaction_date', [$monthStart, $monthEnd])
                ->sum('base_amount');

        $monthlyIncome = (clone $transactions)->where('type', 'income')->whereBetween('transaction_date', [$monthStart, $monthEnd])->sum('base_amount');
        $monthlyExpense = (clone $transactions)->where('type', 'expense')->whereBetween('transaction_date', [$monthStart, $monthEnd])->sum('base_amount');

        return [
            'current_balance' => $user->accounts()->sum('current_balance'),
            'today_income' => $user->transactions()->where('type', 'income')->whereDate('transaction_date', $today)->sum('base_amount'),
            'today_expense' => $user->transactions()->where('type', 'expense')->whereDate('transaction_date', $today)->sum('base_amount'),
            'monthly_income' => $monthlyIncome,
            'monthly_expense' => $monthlyExpense,
            'monthly_savings' => $monthlyIncome - $monthlyExpense,
            'monthly_budget_amount' => $monthlyBudgetAmount,
            'monthly_budget_spent' => $monthlyBudgetSpent,
            'monthly_budget_remaining' => $monthlyBudgetAmount - $monthlyBudgetSpent,
            'monthly_budget_progress' => $monthlyBudgetAmount > 0 ? round(($monthlyBudgetSpent / $monthlyBudgetAmount) * 100, 1) : 0,
            'active_budgets' => $budgets->count(),
            'recent_transactions' => $user->transactions()->with(['account','category'])->whereDate('transaction_date', $today)->latest()->limit(5)->get(),
            'spending_by_category' => $user->transactions()->selectRaw('category_id, sum(base_amount) as total')->where('type', 'expense')->whereBetween('transaction_date', [$monthStart, $monthEnd])->with('category')->groupBy('category_id')->get(),
        ];
    }
}
