import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Loader2, Target, Trash2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { currentMonth, money, readError } from '../lib/format.js';
import { Empty, Panel, PageHeader } from '../components/ui.jsx';
import { Alert, AlertDescription } from '../components/ui/alert.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.jsx';

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
            setForm((current) => ({ ...current, category_id: String(expenseCategories[0].id) }));
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
            await api.post('/budgets', { ...form, amount: Number(form.amount), month });
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
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Budgets"
                description="Set a monthly limit and track your spending against it."
            />
            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <Panel title="Set monthly budget">
                <form onSubmit={saveBudget} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="budget-month">Month</Label>
                        <div className="relative">
                            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="budget-month"
                                type="month"
                                value={month}
                                onChange={(event) => setMonth(event.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="budget-category">Expense category</Label>
                        <Select
                            value={String(form.category_id)}
                            onValueChange={(category_id) => setForm({ ...form, category_id })}
                        >
                            <SelectTrigger id="budget-category" className="w-full">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {expenseCategories.map((category) => (
                                    <SelectItem key={category.id} value={String(category.id)}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="budget-amount">Budget amount ({baseCurrency})</Label>
                        <Input
                            id="budget-amount"
                            type="number"
                            step="any"
                            placeholder="0.00"
                            value={form.amount}
                            onChange={(event) => setForm({ ...form, amount: event.target.value })}
                            required
                        />
                    </div>

                    {expenseCategories.length === 0 && <Empty text="Create an expense category before setting a budget." />}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        disabled={saving || expenseCategories.length === 0}
                        className="w-full gap-2"
                    >
                        {saving ? <Loader2 className="size-4 animate-spin" /> : <Target className="size-4" />}
                        Save budget
                    </Button>
                </form>
            </Panel>

            <Panel title="Monthly budget progress">
                {loading && (
                    <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Loading budgets...
                    </div>
                )}
                <div className="space-y-3">
                    {budgets.length === 0 && !loading && <Empty text="No budgets set for this month yet." />}
                    {budgets.map((budget) => (
                        <BudgetProgress
                            key={budget.id}
                            baseCurrency={baseCurrency}
                            budget={budget}
                            deleting={deletingId === budget.id}
                            onDelete={() => deleteBudget(budget)}
                        />
                    ))}
                </div>
            </Panel>
        </div>
        </div>
    );
}

function BudgetProgress({ baseCurrency, budget, deleting, onDelete }) {
    const progress = Math.min(100, Number(budget.progress_percent || 0));
    const barColor = budget.is_over ? 'bg-destructive' : progress >= 80 ? 'bg-amber-500' : 'bg-emerald-500';

    return (
        <div className="rounded-sm bg-card px-4 py-4 ring-1 ring-foreground/5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate font-semibold">{budget.category?.name || 'Budget'}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {money(budget.spent, baseCurrency)} spent of {money(budget.amount, baseCurrency)}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={deleting}
                    onClick={onDelete}
                    className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete budget"
                >
                    {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                </Button>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-muted-foreground">
                <span>{budget.progress_percent}% used</span>
                <span className={budget.is_over ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}>
                    {budget.is_over
                        ? `${money(Math.abs(Number(budget.remaining)), baseCurrency)} over`
                        : `${money(budget.remaining, baseCurrency)} left`}
                </span>
            </div>
        </div>
    );
}
