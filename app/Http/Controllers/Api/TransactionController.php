<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TransactionController extends Controller
{
    private function getWithRelations(): array
    {
        return \Illuminate\Support\Facades\Schema::hasColumn('transactions', 'sub_category_id')
            ? ['account', 'category', 'subCategory']
            : ['account', 'category'];
    }

    public function index(Request $request)
    {
        return $request->user()->transactions()->with($this->getWithRelations())
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            ->when($request->account_id, fn ($q, $id) => $q->where('account_id', $id))
            ->when($request->category_id, fn ($q, $id) => $q->where('category_id', $id))
            ->when($request->from, fn ($q, $date) => $q->whereDate('transaction_date', '>=', $date))
            ->when($request->to, fn ($q, $date) => $q->whereDate('transaction_date', '<=', $date))
            ->when($request->search, fn ($q, $search) => $q->where(function ($query) use ($search) {
                $query->where('description', 'like', "%{$search}%")
                    ->orWhereHas('category', fn ($categoryQuery) => $categoryQuery->where('name', 'like', "%{$search}%"));
            }))
            ->orderByDesc('transaction_date')->latest()->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $data['user_id'] = $request->user()->id;
        $data = $this->normalizeCurrencyData($data, $request->user()->base_currency);
        $transaction = Transaction::create($data);
        $this->recalculateAccount($transaction->account);
        return $transaction->load($this->getWithRelations());
    }

    public function show(Request $request, string $id)
    {
        return $request->user()->transactions()->with($this->getWithRelations())->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $transaction = $request->user()->transactions()->findOrFail($id);
        $oldAccount = $transaction->account;
        $data = $this->validateData($request, true);
        $data = $this->normalizeCurrencyData([
            'amount' => $data['amount'] ?? $transaction->amount,
            'currency' => $data['currency'] ?? $transaction->currency,
            'exchange_rate' => $data['exchange_rate'] ?? $transaction->exchange_rate,
        ] + $data, $request->user()->base_currency);
        $transaction->update($data);
        $this->recalculateAccount($oldAccount);
        $this->recalculateAccount($transaction->fresh()->account);
        return $transaction->fresh($this->getWithRelations());
    }

    public function destroy(Request $request, string $id)
    {
        $transaction = $request->user()->transactions()->findOrFail($id);
        $account = $transaction->account;
        $transaction->delete();
        $this->recalculateAccount($account);
        return response()->noContent();
    }

    private function validateData(Request $request, bool $partial = false): array
    {
        $rule = $partial ? 'sometimes' : 'required';
        $userId = $request->user()->id;

        return $request->validate([
            'account_id' => [$rule, Rule::exists('accounts', 'id')->where('user_id', $userId)],
            'category_id' => [$rule, Rule::exists('categories', 'id')->where('user_id', $userId)],
            'sub_category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->where('user_id', $userId)],
            'type' => [$rule, 'in:income,expense'],
            'amount' => [$rule, 'numeric', 'gt:0'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'exchange_rate' => ['sometimes', 'numeric', 'gt:0'],
            'transaction_date' => [$rule, 'date'],
            'payment_method' => ['nullable', 'string', 'max:80'],
            'description' => ['nullable', 'string', 'max:1000'],
            'tags' => ['nullable', 'array'],
            'receipt_url' => ['nullable', 'url'],
        ]);
    }

    private function normalizeCurrencyData(array $data, string $baseCurrency): array
    {
        $currency = $data['currency'] ?? $baseCurrency;
        $amount = (float) $data['amount'];
        $rate = (float) ($data['exchange_rate'] ?? 1);

        if ($currency === $baseCurrency) {
            $data['exchange_rate'] = 1;
            $data['base_amount'] = $amount;
            return $data;
        }

        $data['exchange_rate'] = $rate;
        $data['base_amount'] = $baseCurrency === 'USD' ? $amount / $rate : $amount * $rate;

        return $data;
    }

    private function recalculateAccount(Account $account): void
    {
        $income = $account->transactions()->where('type', 'income')->sum('base_amount');
        $expense = $account->transactions()->where('type', 'expense')->sum('base_amount');
        $account->forceFill(['current_balance' => $account->starting_balance + $income - $expense])->save();
    }

    public function duplicate(Request $request, string $id)
    {
        $original = $request->user()->transactions()->findOrFail($id);
        $data = $original->only(['account_id', 'category_id', 'sub_category_id', 'type', 'amount', 'currency', 'exchange_rate', 'base_amount', 'payment_method', 'description', 'tags']);
        $data['user_id'] = $request->user()->id;
        $data['transaction_date'] = now()->toDateString();
        $copy = Transaction::create($data);
        $this->recalculateAccount($copy->account);
        return $copy->load(['account', 'category', 'subCategory']);
    }
}
