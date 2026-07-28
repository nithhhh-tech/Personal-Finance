<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $month = $this->monthStart($request->query('month'));

        return $this->budgetQuery($request, $month)
            ->get()
            ->map(fn (Budget $budget) => $this->withProgress($request, $budget, $month))
            ->values();
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $month = $this->monthStart($data['month']);
        $budget = Budget::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'category_id' => $data['category_id'],
                'month' => $month,
            ],
            [
                'amount' => $data['amount'],
                'currency' => $request->user()->base_currency,
            ],
        );

        return response()->json($this->withProgress($request, $budget->fresh(['category']), $month), 201);
    }

    public function show(Request $request, string $id)
    {
        $budget = $request->user()->budgets()->with('category')->findOrFail($id);

        return $this->withProgress($request, $budget, $budget->month);
    }

    public function update(Request $request, string $id)
    {
        $budget = $request->user()->budgets()->findOrFail($id);
        $data = $this->validateData($request, true);
        $budget->update([
            'category_id' => $data['category_id'] ?? $budget->category_id,
            'month' => isset($data['month']) ? $this->monthStart($data['month']) : $budget->month,
            'amount' => $data['amount'] ?? $budget->amount,
            'currency' => $request->user()->base_currency,
        ]);

        return $this->withProgress($request, $budget->fresh(['category']), $budget->fresh()->month);
    }

    public function destroy(Request $request, string $id)
    {
        $request->user()->budgets()->findOrFail($id)->delete();

        return response()->noContent();
    }

    private function budgetQuery(Request $request, Carbon $month)
    {
        return $request->user()
            ->budgets()
            ->with('category')
            ->whereDate('month', $month)
            ->orderByDesc('amount');
    }

    private function validateData(Request $request, bool $partial = false): array
    {
        $rule = $partial ? 'sometimes' : 'required';
        $userId = $request->user()->id;

        return $request->validate([
            'category_id' => [$rule, Rule::exists('categories', 'id')->where('user_id', $userId)->where('type', 'expense')],
            'month' => [$rule, 'date_format:Y-m'],
            'amount' => [$rule, 'numeric', 'gt:0'],
        ]);
    }

    private function monthStart(?string $month): Carbon
    {
        return $month
            ? Carbon::createFromFormat(strlen($month) === 7 ? 'Y-m-d' : 'Y-m-d', strlen($month) === 7 ? "{$month}-01" : $month)->startOfMonth()
            : Carbon::now()->startOfMonth();
    }

    private function withProgress(Request $request, Budget $budget, Carbon $month): array
    {
        $spent = (float) $request->user()
            ->transactions()
            ->where('type', 'expense')
            ->where('category_id', $budget->category_id)
            ->whereBetween('transaction_date', [$month->copy()->startOfMonth(), $month->copy()->endOfMonth()])
            ->sum('base_amount');
        $amount = (float) $budget->amount;
        $remaining = $amount - $spent;
        $progress = $amount > 0 ? min(999, round(($spent / $amount) * 100, 1)) : 0;

        return [
            'id' => $budget->id,
            'category_id' => $budget->category_id,
            'category' => $budget->category,
            'month' => $budget->month->format('Y-m'),
            'amount' => $budget->amount,
            'currency' => $budget->currency,
            'spent' => number_format($spent, 2, '.', ''),
            'remaining' => number_format($remaining, 2, '.', ''),
            'progress_percent' => $progress,
            'is_over' => $spent > $amount,
        ];
    }
}
