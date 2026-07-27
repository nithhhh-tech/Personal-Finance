import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../lib/api.js';
import { readError, today } from '../lib/format.js';
import { Empty, Input, Select } from './ui.jsx';

export default function TransactionForm({ accounts, categories, onCreated }) {
    const [form, setForm] = useState({
        type: 'expense',
        account_id: '',
        category_id: '',
        amount: '',
        currency: 'USD',
        exchange_rate: 1,
        transaction_date: today,
        payment_method: '',
        description: '',
    });
    const [error, setError] = useState('');
    const availableCategories = categories.filter((category) => category.type === form.type);

    useEffect(() => {
        if (!form.account_id && accounts[0]) setForm((current) => ({ ...current, account_id: accounts[0].id }));
    }, [accounts]);

    useEffect(() => {
        const first = availableCategories[0];
        if (first && !availableCategories.some((category) => String(category.id) === String(form.category_id))) {
            setForm((current) => ({ ...current, category_id: first.id }));
        }
    }, [form.type, categories]);

    async function submit(event) {
        event.preventDefault();
        setError('');

        try {
            await api.post('/transactions', form);
            setForm({ ...form, amount: '', description: '', transaction_date: today });
            onCreated();
        } catch (err) {
            setError(readError(err));
        }
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            {accounts.length === 0 && <Empty text="Add a wallet before recording money." />}
            <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Type" value={form.type} onChange={(type) => setForm({ ...form, type, category_id: '' })} options={[['expense', 'Spent'], ['income', 'Earned']]} />
                <Input label="Amount earned/spent" type="number" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
                <Select label="Wallet" value={form.account_id} onChange={(account_id) => setForm({ ...form, account_id })} options={accounts.map((account) => [account.id, account.name])} />
                <Select label="Category" value={form.category_id} onChange={(category_id) => setForm({ ...form, category_id })} options={availableCategories.map((category) => [category.id, category.name])} />
                <Input label="Date" type="date" value={form.transaction_date} onChange={(transaction_date) => setForm({ ...form, transaction_date })} />
                <Input label="Payment method" value={form.payment_method} onChange={(payment_method) => setForm({ ...form, payment_method })} />
            </div>
            <label className="block text-sm font-semibold text-slate-700">
                Note
                <textarea
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    className="mt-1 min-h-24 w-full rounded-md border border-slate-200 bg-[#f7f9fb] px-3 py-2 outline-none transition focus:border-[#18b875] focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
            </label>
            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button disabled={accounts.length === 0} className="inline-flex h-11 items-center gap-2 rounded-md bg-[#18b875] px-4 font-semibold text-white shadow-lg shadow-emerald-200/70 hover:bg-[#119662] disabled:cursor-not-allowed disabled:opacity-50">
                <Plus size={18} />
                Save money record
            </button>
        </form>
    );
}
