import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../lib/api.js';
import { readError, today } from '../lib/format.js';
import { Empty, Input, Select } from './ui.jsx';

const DEFAULT_KHR_PER_USD = 4100;

function blankForm(type = 'expense') {
    return {
        type,
        account_id: '',
        category_id: '',
        amount: '',
        currency: 'USD',
        exchange_rate: DEFAULT_KHR_PER_USD,
        transaction_date: today,
        payment_method: '',
        description: '',
    };
}

function formFromTransaction(transaction, fallbackType) {
    if (!transaction) return blankForm(fallbackType);

    return {
        type: transaction.type || fallbackType,
        account_id: transaction.account_id || '',
        category_id: transaction.category_id || '',
        amount: transaction.amount || '',
        currency: transaction.currency || 'USD',
        exchange_rate: Number(transaction.exchange_rate || DEFAULT_KHR_PER_USD),
        transaction_date: String(transaction.transaction_date || today).slice(0, 10),
        payment_method: transaction.payment_method || '',
        description: transaction.description || '',
    };
}

export default function TransactionForm({ accounts, baseCurrency = 'USD', categories, hideType = false, initialType = 'expense', onCreated, onSavingChange = null, transaction = null }) {
    const [form, setForm] = useState(() => formFromTransaction(transaction, initialType));
    const [error, setError] = useState('');
    const editing = Boolean(transaction);
    const availableCategories = categories.filter((category) => category.type === form.type);
    const needsExchangeRate = form.currency !== baseCurrency;

    useEffect(() => {
        if (!editing && !form.account_id && accounts[0]) setForm((current) => ({ ...current, account_id: accounts[0].id }));
    }, [accounts, editing, form.account_id]);

    useEffect(() => {
        const first = availableCategories[0];
        if (first && !availableCategories.some((category) => String(category.id) === String(form.category_id))) {
            setForm((current) => ({ ...current, category_id: first.id }));
        }
    }, [form.type, categories]);

    useEffect(() => {
        if (!editing) setForm((current) => ({ ...current, type: initialType, category_id: '' }));
    }, [initialType, editing]);

    useEffect(() => {
        if (editing) setForm(formFromTransaction(transaction, initialType));
        setError('');
    }, [transaction, initialType, editing]);

    useEffect(() => {
        if (needsExchangeRate && Number(form.exchange_rate || 0) <= 1) {
            setForm((current) => ({ ...current, exchange_rate: DEFAULT_KHR_PER_USD }));
        }
    }, [needsExchangeRate, form.exchange_rate]);

    async function submit(event) {
        event.preventDefault();
        setError('');
        onSavingChange?.(true);

        try {
            if (editing) {
                await api.put(`/transactions/${transaction.id}`, form);
            } else {
                await api.post('/transactions', form);
                setForm({ ...form, amount: '', description: '', transaction_date: today });
            }
            onCreated();
        } catch (err) {
            setError(readError(err));
        } finally {
            onSavingChange?.(false);
        }
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            {accounts.length === 0 && <Empty text="Add a wallet before recording money." />}
            <div className="grid gap-4 sm:grid-cols-2">
                {!hideType && <Select label="Type" value={form.type} onChange={(type) => setForm({ ...form, type, category_id: '' })} options={[['expense', 'Spent'], ['income', 'Earned']]} />}
                <Input label="Amount earned/spent" type="number" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
                <Select label="Currency" value={form.currency} onChange={(currency) => setForm({ ...form, currency, exchange_rate: currency === baseCurrency ? 1 : DEFAULT_KHR_PER_USD })} options={[['USD', 'USD'], ['KHR', 'KHR']]} />
                <Select label="Wallet" value={form.account_id} onChange={(account_id) => setForm({ ...form, account_id })} options={accounts.map((account) => [account.id, account.name])} />
                <Select label="Category" value={form.category_id} onChange={(category_id) => setForm({ ...form, category_id })} options={availableCategories.map((category) => [category.id, category.name])} />
                {needsExchangeRate && (
                    <label className="block text-sm font-semibold text-[#d9c4ad]">
                        1 USD =
                        <div className="mt-1 flex h-11 items-center rounded-md border border-[#8f633e]/60 bg-[#2a1a12]/70 focus-within:border-[#d7a86e] focus-within:ring-4 focus-within:ring-[#d7a86e]/15">
                            <input
                                type="number"
                                min="1"
                                value={form.exchange_rate}
                                onChange={(event) => setForm({ ...form, exchange_rate: event.target.value })}
                                className="h-full min-w-0 flex-1 bg-transparent px-3 text-[#fff8ef] outline-none"
                            />
                            <span className="shrink-0 px-3 text-sm font-bold text-[#f2c38b]">KHR</span>
                        </div>
                        <span className="mt-1 block text-xs font-medium text-[#b89a7f]">Default is 4,100. Change it if your actual rate is different.</span>
                    </label>
                )}
                <Input label="Date" type="date" value={form.transaction_date} onChange={(transaction_date) => setForm({ ...form, transaction_date })} />
                <Input label="Payment method" value={form.payment_method} onChange={(payment_method) => setForm({ ...form, payment_method })} />
            </div>
            <label className="block text-sm font-semibold text-[#d9c4ad]">
                Note
                <textarea
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    className="mt-1 min-h-24 w-full rounded-md border border-[#8f633e]/60 bg-[#2a1a12]/70 px-3 py-2 text-[#fff8ef] outline-none transition focus:border-[#d7a86e] focus:ring-4 focus:ring-[#d7a86e]/15"
                />
            </label>
            {error && <p className="rounded-md border border-red-300/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">{error}</p>}
            <button disabled={accounts.length === 0} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#d7a86e] px-4 font-bold text-[#2a1a12] shadow-lg shadow-black/20 hover:bg-[#e8bb82] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                <Plus size={18} />
                {editing ? 'Update money record' : 'Save money record'}
            </button>
        </form>
    );
}
