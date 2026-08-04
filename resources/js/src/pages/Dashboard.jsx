import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownLeft, ArrowUpRight, Banknote, CalendarDays, Loader2, RotateCcw, Target, WalletCards } from 'lucide-react';
import FirstUserOnboarding from '../components/FirstUserOnboarding.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import { ChartBox, DarkStat, Empty, Metric, Panel, Row, WalletCard } from '../components/ui.jsx';
import { buildMonthlyData, money, shortDate, today } from '../lib/format.js';
import { api } from '../lib/api.js';
import { toast } from '../components/Toast.jsx';

export default function Dashboard({ summary, transactions, categories, accounts, baseCurrency, onCreated, openQuickRecord, setActiveView }) {
    const [repeatingId, setRepeatingId] = useState(null);
    const safeTransactions = useMemo(() => {
        return Array.isArray(transactions) ? transactions : (Array.isArray(transactions?.data) ? transactions.data : []);
    }, [transactions]);

    const monthlyData = useMemo(() => buildMonthlyData(safeTransactions), [safeTransactions]);
    const categoryData = useMemo(() => {
        return summary?.spending_by_category?.map((item) => ({
            name: item.category?.name || 'Other',
            total: Number(item.total || 0),
            color: item.category?.color || '#d7a86e',
        })) || [];
    }, [summary]);

    const totalCategorySpent = useMemo(() => {
        return categoryData.reduce((sum, item) => sum + item.total, 0);
    }, [categoryData]);

    const subcategorySpending = useMemo(() => {
        if (summary?.spending_by_subcategory?.length) {
            return summary.spending_by_subcategory.map((item) => ({
                name: item.sub_category?.name || 'General',
                parentName: item.category?.name || 'Expense',
                total: Number(item.total || 0),
                color: item.sub_category?.color || item.category?.color || '#d7a86e',
            }));
        }

        const map = {};
        safeTransactions
            .filter((t) => t && t.type === 'expense' && (t.sub_category_id || t.sub_category))
            .forEach((t) => {
                const subName = t.sub_category?.name || 'General';
                const parentName = t.category?.name || 'Expense';
                const key = `${parentName}:${subName}`;
                if (!map[key]) {
                    map[key] = {
                        name: subName,
                        parentName,
                        total: 0,
                        color: t.sub_category?.color || t.category?.color || '#d7a86e',
                    };
                }
                map[key].total += Number(t.base_amount || 0);
            });
        return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 6);
    }, [summary, safeTransactions]);

    const localToday = useMemo(() => new Date().toLocaleDateString('en-CA'), []);
    const todayTransactions = useMemo(() => {
        return safeTransactions.filter((item) => {
            if (!item) return false;
            const itemDate = String(item.transaction_date || '').slice(0, 10);
            return itemDate === localToday || itemDate === today;
        });
    }, [safeTransactions, localToday]);

    async function handleRepeatTransaction(item) {
        setRepeatingId(item.id);
        try {
            await api.post(`/transactions/${item.id}/duplicate`);
            toast(`Repeated ${item.description || item.category?.name || 'record'} for today!`, 'success');
            onCreated();
        } catch (err) {
            toast('Could not repeat transaction.', 'error');
        } finally {
            setRepeatingId(null);
        }
    }

    return (
        <div className="space-y-5 sm:space-y-6">
            <FirstUserOnboarding accounts={accounts} baseCurrency={baseCurrency} categories={categories} onCreated={onCreated} transactions={transactions} />

            {/* Live Overview & Today's Records */}
            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="overflow-hidden rounded-xl border border-[#8f633e]/45 bg-[#2a1a12] p-4 text-[#f8efe3] shadow-xl shadow-black/25 sm:p-6">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-[#8f633e]/45 bg-[#3a251a] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f2c38b] sm:mb-5 sm:text-xs">
                            <CalendarDays size={14} />
                            Live overview
                        </div>
                        <p className="text-xs font-medium text-[#d9c4ad] sm:text-sm">Money left</p>
                        <p className="mt-1 truncate text-3xl font-extrabold tracking-tight sm:mt-2 sm:text-4xl lg:text-5xl">{money(summary?.current_balance, baseCurrency)}</p>
                        <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
                            <DarkStat label="Earned" value={money(summary?.monthly_income, baseCurrency)} color="text-emerald-300" />
                            <DarkStat label="Spent" value={money(summary?.monthly_expense, baseCurrency)} color="text-rose-300" />
                            <DarkStat label="Left" value={money(summary?.monthly_savings, baseCurrency)} color="text-[#89e6ba]" />
                        </div>
                    </div>
                </section>
                <Panel title="Today's money records">
                    <div className="space-y-2.5">
                        {todayTransactions.length === 0 && <Empty text="No money records added today." />}
                        {todayTransactions.slice(0, 5).map((item) => (
                            <Row
                                key={item.id}
                                title={item.description || item.category?.name || 'Transaction'}
                                meta={`${shortDate(item.transaction_date)} / ${item.account?.name || 'Wallet'}`}
                                value={`${item.type === 'income' ? '+' : '-'}${money(item.base_amount, baseCurrency)}`}
                                tone={item.type === 'income' ? 'text-[#89e6ba]' : 'text-[#f0a36f]'}
                                action={(
                                    <button
                                        type="button"
                                        disabled={repeatingId === item.id}
                                        onClick={() => handleRepeatTransaction(item)}
                                        className="inline-flex h-8 items-center gap-1 rounded-md border border-[#8f633e]/70 bg-[#3a251a] px-2 text-[11px] font-extrabold text-[#f2c38b] hover:border-[#d7a86e] hover:bg-[#4a3022] hover:text-white disabled:opacity-50 transition"
                                        title="Repeat this record for today"
                                    >
                                        {repeatingId === item.id ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
                                        Repeat
                                    </button>
                                )}
                            />
                        ))}
                    </div>
                </Panel>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4 sm:gap-4">
                <Metric title="Earned today" value={money(summary?.today_income, baseCurrency)} icon={ArrowUpRight} tone="emerald" />
                <Metric title="Spent today" value={money(summary?.today_expense, baseCurrency)} icon={ArrowDownLeft} tone="rose" />
                <Metric title="Earned this month" value={money(summary?.monthly_income, baseCurrency)} icon={Banknote} tone="blue" />
                <Metric title={summary?.active_budgets ? 'Budget left' : 'Wallets'} value={summary?.active_budgets ? money(summary?.monthly_budget_remaining, baseCurrency) : accounts.length} icon={summary?.active_budgets ? Target : WalletCards} tone="amber" />
            </div>

            {/* Monthly Budget */}
            {summary?.active_budgets > 0 && (
                <Panel title="Monthly budget progress">
                    <div className="grid gap-4 lg:grid-cols-[1fr_220px] lg:items-center">
                        <div>
                            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                                <p className="font-semibold text-[#fff8ef]">{summary.monthly_budget_progress}% used</p>
                                <p className="text-[#d9c4ad]">{money(summary.monthly_budget_spent, baseCurrency)} spent of {money(summary.monthly_budget_amount, baseCurrency)}</p>
                            </div>
                            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#2a1a12]/70">
                                <div className={`h-full rounded-full ${summary.monthly_budget_progress > 100 ? 'bg-red-400' : summary.monthly_budget_progress >= 80 ? 'bg-[#f0a36f]' : 'bg-[#89e6ba]'}`} style={{ width: `${Math.min(100, Number(summary.monthly_budget_progress || 0))}%` }} />
                            </div>
                        </div>
                        <div className="rounded-md border border-[#8f633e]/45 bg-[#2a1a12]/45 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f2c38b]">Remaining</p>
                            <p className={`mt-1 text-xl font-semibold ${summary.monthly_budget_remaining < 0 ? 'text-red-300' : 'text-[#89e6ba]'}`}>{money(summary.monthly_budget_remaining, baseCurrency)}</p>
                        </div>
                    </div>
                </Panel>
            )}

            {/* Visual Wallet Cards Section */}
            <Panel
                title="Wallet balances"
                action={
                    <button
                        type="button"
                        onClick={() => setActiveView?.('accounts')}
                        className="text-xs font-bold text-[#f2c38b] hover:underline"
                    >
                        Manage wallets →
                    </button>
                }
            >
                {accounts.length === 0 ? (
                    <Empty text="Create your first cash wallet, ABA, Wing, or savings wallet." />
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {accounts.map((account) => (
                            <WalletCard
                                key={account.id}
                                name={account.name}
                                type={account.type}
                                currency={account.currency}
                                balance={money(account.current_balance, account.currency)}
                                onClick={() => setActiveView?.('accounts')}
                            />
                        ))}
                    </div>
                )}
            </Panel>

            {/* Earned vs Spent & Spent by Category Charts */}
            <div className="grid gap-6 xl:grid-cols-2">
                <Panel title="Earned vs spent">
                    <ChartBox>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#5f3e2a" />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#d9c4ad' }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#d9c4ad' }} />
                                <Tooltip formatter={(value) => money(value, baseCurrency)} contentStyle={{ borderRadius: 8, borderColor: '#8f633e', background: '#3a251a', color: '#f8efe3' }} />
                                <Bar dataKey="income" fill="#22c55e" radius={[5, 5, 0, 0]} />
                                <Bar dataKey="expense" fill="#f43f5e" radius={[5, 5, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartBox>
                </Panel>

                <Panel title="Spent by category">
                    <ChartBox>
                        {categoryData.length ? (
                            <div className="flex h-full flex-col justify-between">
                                <div className="h-48 min-h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={categoryData} dataKey="total" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={4}>
                                                {categoryData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                            </Pie>
                                            <Tooltip formatter={(value) => money(value, baseCurrency)} contentStyle={{ borderRadius: 8, borderColor: '#8f633e', background: '#3a251a', color: '#f8efe3' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-2 border-t border-[#8f633e]/30 pt-3">
                                    {categoryData.slice(0, 4).map((item) => {
                                        const percent = totalCategorySpent > 0 ? Math.round((item.total / totalCategorySpent) * 100) : 0;
                                        return (
                                            <div key={item.name} className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                                                    <span className="truncate text-[#d9c4ad]">{item.name}</span>
                                                </div>
                                                <span className="font-bold text-[#fff8ef]">{percent}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : <Empty text="Add spending records to see where money goes." />}
                    </ChartBox>
                </Panel>
            </div>

            {/* Top Spent Sub-Categories Breakdown */}
            <Panel title="What you spend the most on (Sub-categories)">
                {subcategorySpending.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {subcategorySpending.map((item) => {
                            const percent = totalCategorySpent > 0 ? Math.round((item.total / totalCategorySpent) * 100) : 0;
                            return (
                                <div key={`${item.parentName}-${item.name}`} className="rounded-lg border border-[#8f633e]/40 bg-[#2a1a12]/70 p-3.5 shadow-sm">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 truncate">
                                            <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="truncate font-bold text-[#fff8ef]">{item.name}</span>
                                            <span className="shrink-0 text-[10px] text-[#b89a7f]">({item.parentName})</span>
                                        </div>
                                        <span className="font-extrabold text-[#f2c38b]">{money(item.total, baseCurrency)}</span>
                                    </div>
                                    <div className="mt-2.5 flex items-center gap-2">
                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#3a251a]">
                                            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, Math.max(5, percent))}%`, backgroundColor: item.color }} />
                                        </div>
                                        <span className="text-[11px] font-bold text-[#d9c4ad]">{percent}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <Empty text="Assign sub-categories to your transactions to see what specific items you spend the most on (e.g., Coffee, Groceries, Fuel)." />
                )}
            </Panel>
        </div>
    );
}

