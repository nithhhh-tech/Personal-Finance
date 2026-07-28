<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    public function monthly(Request $request)
    {
        $data = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
        ]);
        $month = isset($data['month'])
            ? Carbon::createFromFormat('Y-m-d', $data['month'].'-01')->startOfMonth()
            : Carbon::now()->startOfMonth();
        $previousMonth = $month->copy()->subMonth();
        $current = $this->monthMetrics($request, $month);
        $previous = $this->monthMetrics($request, $previousMonth);

        return [
            'month' => $month->format('Y-m'),
            'month_label' => $month->format('F Y'),
            'previous_month' => $previousMonth->format('Y-m'),
            'previous_month_label' => $previousMonth->format('F Y'),
            'current' => $current,
            'previous' => $previous,
            'comparison' => [
                'income' => $this->change($current['income'], $previous['income']),
                'expense' => $this->change($current['expense'], $previous['expense']),
                'savings' => $this->change($current['savings'], $previous['savings']),
                'transaction_count' => $this->change($current['transaction_count'], $previous['transaction_count']),
            ],
            'daily_trend' => $this->dailyTrend($request, $month),
            'category_comparison' => $this->categoryComparison($request, $month, $previousMonth),
        ];
    }

    private function monthMetrics(Request $request, Carbon $month): array
    {
        $start = $month->copy()->startOfMonth();
        $end = $month->copy()->endOfMonth();
        $income = (float) $request->user()
            ->transactions()
            ->where('type', 'income')
            ->whereBetween('transaction_date', [$start, $end])
            ->sum('base_amount');
        $expense = (float) $request->user()
            ->transactions()
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$start, $end])
            ->sum('base_amount');

        return [
            'income' => round($income, 2),
            'expense' => round($expense, 2),
            'savings' => round($income - $expense, 2),
            'transaction_count' => $request->user()
                ->transactions()
                ->whereBetween('transaction_date', [$start, $end])
                ->count(),
        ];
    }

    private function dailyTrend(Request $request, Carbon $month): array
    {
        $days = [];

        foreach (range(1, $month->daysInMonth) as $day) {
            $date = $month->copy()->day($day);
            $days[$date->toDateString()] = [
                'date' => $date->toDateString(),
                'label' => $date->format('M j'),
                'income' => 0,
                'expense' => 0,
            ];
        }

        $request->user()
            ->transactions()
            ->whereBetween('transaction_date', [$month->copy()->startOfMonth(), $month->copy()->endOfMonth()])
            ->get(['transaction_date', 'type', 'base_amount'])
            ->each(function (Transaction $transaction) use (&$days) {
                $date = $transaction->transaction_date->toDateString();
                if (isset($days[$date])) {
                    $days[$date][$transaction->type] += (float) $transaction->base_amount;
                }
            });

        return array_values(array_map(fn (array $day) => [
            ...$day,
            'income' => round($day['income'], 2),
            'expense' => round($day['expense'], 2),
        ], $days));
    }

    private function categoryComparison(Request $request, Carbon $month, Carbon $previousMonth): array
    {
        $currentRows = $this->categoryTotals($request, $month);
        $previousRows = $this->categoryTotals($request, $previousMonth);
        $categoryIds = $currentRows->keys()->merge($previousRows->keys())->unique();

        return $categoryIds
            ->map(function ($categoryId) use ($currentRows, $previousRows) {
                $currentRow = $currentRows->get($categoryId);
                $previousRow = $previousRows->get($categoryId);
                $current = (float) ($currentRow?->total ?? 0);
                $previous = (float) ($previousRow?->total ?? 0);

                return [
                    'category_id' => (int) $categoryId,
                    'category' => $currentRow?->category ?? $previousRow?->category,
                    'current' => round($current, 2),
                    'previous' => round($previous, 2),
                    'difference' => round($current - $previous, 2),
                    'change' => $this->change($current, $previous),
                ];
            })
            ->sortByDesc(fn (array $item) => max($item['current'], $item['previous']))
            ->values()
            ->all();
    }

    private function categoryTotals(Request $request, Carbon $month)
    {
        return $request->user()
            ->transactions()
            ->selectRaw('category_id, sum(base_amount) as total')
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$month->copy()->startOfMonth(), $month->copy()->endOfMonth()])
            ->with('category')
            ->groupBy('category_id')
            ->get()
            ->keyBy('category_id');
    }

    private function change(float|int $current, float|int $previous): array
    {
        $difference = round($current - $previous, 2);

        return [
            'amount' => $difference,
            'percent' => $previous > 0 ? round(($difference / $previous) * 100, 1) : null,
            'direction' => $difference > 0 ? 'up' : ($difference < 0 ? 'down' : 'same'),
        ];
    }
}
