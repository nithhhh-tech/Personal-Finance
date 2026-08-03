import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Loader2, Target, Trash2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { currentMonth, money, readError } from '../lib/format.js';
import { Empty, Input, Panel, Select } from '../components/ui.jsx';

export default function Budgets({ baseCurrency, categories, onChanged }) {
    const expenseCategories = useMemo(() => categories.filter((category) => category.type === 'expense'), [categories]);
    const [month, setMonth] = useState(currentMonth);
    const [budgets, setBudgets] = useState([]);
    const [form, setForm] = useState({ category_id: '', amount: '' });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!form.category_id && expenseCategories[0]) {
            setForm((current) => ({ ...current, category_id: expenseCategories[0].id }));
        }
    }, [expenseCategories, form.category_id]);

    useEffect(() => {
        loadBudgets();
    }, [month]);

    async function loadBudgets() {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/budgets', { params: { month } });
            setBudgets(response.data);
        } catch (err) {
            setError(readError(err));
        } finally {
            setLoading(false);
        }
    }

    async function saveBudget(event) {
        event.preventDefault();
        setSaving(true);
        setError('');

        try {
            await api.post('/budgets', { ...form, month });
            setForm({ category_id: form.category_id, amount: '' });
            await loadBudgets();
            onChanged();
        } catch (err) {
            setError(readError(err));
        } finally {
            setSaving(false);
        }
    }

    async function deleteBudget(budget) {
        setDeletingId(budget.id);
        setError('');

        try {
            await api.delete(`/budgets/${budget.id}`);
            await loadBudgets();
            onChanged();
        } catch (err) {
            setError(readError(err));
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
            <Panel title="Set monthly budget">
                <form onSubmit={saveBudget} className="space-y-4">
                    <label className="block text-sm font-semibold text-[#d9c4ad]">
                        Month
                        <div className="mt-1 flex h-11 items-center gap-2 rounded-md border border-[#8f633e]/60 bg-[#2a1a12]/70 px-3 focus-within:border-[#d7a86e] focus-within:ring-4 focus-within:ring-[#d7a86e]/15">
                            <CalendarDays size={17} className="text-[#f2c38b]" />
                            <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="w-full bg-transparent text-[#fff8ef] outline-none" />
                        </div>
                    </label>
                    <Select label="Expense category" value={form.category_id} onChange={(category_id) => setForm({ ...form, category_id })} options={expenseCategories.map((category) => [category.id, category.name])} />
                    <Input label={`Budget amount (${baseCurrency})`} type="number" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
                    {expenseCategories.length === 0 && <Empty text="Create an expense category before setting a budget." />}
                    {error && <p className="rounded-md border border-red-300/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">{error}</p>}
                    <button disabled={saving || expenseCategories.length === 0} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#d7a86e] px-4 font-bold text-[#2a1a12] shadow-lg shadow-black/20 hover:bg-[#e8bb82] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Target size={18} />}
                        Save budget
                    </button>
                </form>
            </Panel>

            <Panel title="Monthly budget progress">
                {loading && <div className="mb-3 flex h-10 items-center gap-2 rounded-md border border-[#8f633e]/45 bg-[#2a1a12]/60 px-3 text-sm text-[#d9c4ad]"><Loader2 size={16} className="animate-spin text-[#f2c38b]" />Loading budgets...</div>}
                <div className="space-y-3">
                    {budgets.length === 0 && !loading && <Empty text="No budgets set for this month yet." />}
                    {budgets.map((budget) => (
                        <BudgetProgress key={budget.id} baseCurrency={baseCurrency} budget={budget} deleting={deletingId === budget.id} onDelete={() => deleteBudget(budget)} />
                    ))}
                </div>
            </Panel>
        </div>
    );
}

function BudgetProgress({ baseCurrency, budget, deleting, onDelete }) {
    const progress = Math.min(100, Number(budget.progress_percent || 0));
    const barColor = budget.is_over ? 'bg-red-300' : progress >= 80 ? 'bg-[#f0a36f]' : 'bg-[#89e6ba]';

    return (
        <div className="rounded-md border border-[#8f633e]/45 bg-[#2a1a12]/45 p-4 text-[#f8efe3]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate font-semibold">{budget.category?.name || 'Budget'}</p>
                    <p className="mt-1 text-sm text-[#d9c4ad]">
                        {money(budget.spent, baseCurrency)} spent of {money(budget.amount, baseCurrency)}
                    </p>
                </div>
                <button type="button" disabled={deleting} onClick={onDelete} className="flex size-9 shrink-0 items-center justify-center rounded-md border border-red-300/35 bg-red-950/25 text-red-100 hover:border-red-200/70 hover:bg-red-900/45 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Delete budget">
                    {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#3a251a]">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#d9c4ad]">
                <span>{budget.progress_percent}% used</span>
                <span className={budget.is_over ? 'text-red-100' : 'text-[#89e6ba]'}>
                    {budget.is_over ? `${money(Math.abs(Number(budget.remaining)), baseCurrency)} over` : `${money(budget.remaining, baseCurrency)} left`}
                </span>
            </div>
        </div>
    );
}
