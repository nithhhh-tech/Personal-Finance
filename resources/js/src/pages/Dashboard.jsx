import { useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownLeft, ArrowUpRight, Banknote, CalendarDays, Target, WalletCards } from 'lucide-react';
import FirstUserOnboarding from '../components/FirstUserOnboarding.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import { ChartBox, DarkStat, Empty, Metric, Panel, Row } from '../components/ui.jsx';
import { buildMonthlyData, money, shortDate, today } from '../lib/format.js';

export default function Dashboard({ summary, transactions, categories, accounts, baseCurrency, onCreated }) {
    const monthlyData = useMemo(() => buildMonthlyData(transactions), [transactions]);
    const categoryData = summary?.spending_by_category?.map((item) => ({
        name: item.category?.name || 'Other',
        total: Number(item.total || 0),
        color: item.category?.color || '#64748b',
    })) || [];
    const sparkData = monthlyData.length ? monthlyData : [{ name: 'Start', income: 0, expense: 0 }];

    const localToday = useMemo(() => new Date().toLocaleDateString('en-CA'), []);
    const todayTransactions = useMemo(() => {
        return transactions.filter((item) => {
            const itemDate = String(item.transaction_date || '').slice(0, 10);
            return itemDate === localToday || itemDate === today;
        });
    }, [transactions, localToday]);

    return (
        <div className="space-y-6">
            <FirstUserOnboarding accounts={accounts} baseCurrency={baseCurrency} categories={categories} onCreated={onCreated} transactions={transactions} />

            <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                <section className="overflow-hidden rounded-lg border border-[#8f633e]/45 bg-[#2a1a12] text-[#f8efe3] shadow-xl shadow-black/25">
                    <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-[1fr_260px] md:gap-6">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-[#8f633e]/45 bg-[#3a251a] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#f2c38b] sm:mb-6">
                                <CalendarDays size={14} />
                                Live overview
                            </div>
                            <p className="text-sm text-[#d9c4ad]">Money left</p>
                            <p className="mt-2 break-words text-4xl font-bold tracking-normal sm:text-5xl">{money(summary?.current_balance, baseCurrency)}</p>
                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <DarkStat label="Earned" value={money(summary?.monthly_income, baseCurrency)} color="text-emerald-300" />
                                <DarkStat label="Spent" value={money(summary?.monthly_expense, baseCurrency)} color="text-rose-300" />
                                <DarkStat label="Left" value={money(summary?.monthly_savings, baseCurrency)} color="text-sky-300" />
                            </div>
                        </div>
                        <div className="h-40 min-h-40 sm:h-48 sm:min-h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sparkData}>
                                    <defs>
                                        <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#34d399" stopOpacity="0.55" />
                                            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="income" stroke="#34d399" strokeWidth={3} fill="url(#incomeFill)" dot={false} activeDot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>
                <Panel title="Today's money records">
                    <div className="space-y-3">
                        {todayTransactions.length === 0 && <Empty text="No money records added today." />}
                        {todayTransactions.slice(0, 5).map((item) => (
                            <Row key={item.id} title={item.description || item.category?.name || 'Transaction'} meta={`${shortDate(item.transaction_date)} / ${item.account?.name || 'Wallet'}`} value={`${item.type === 'income' ? '+' : '-'}${money(item.base_amount, baseCurrency)}`} tone={item.type === 'income' ? 'text-[#89e6ba]' : 'text-[#f0a36f]'} />
                        ))}
                    </div>
                </Panel>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Metric title="Earned today" value={money(summary?.today_income, baseCurrency)} icon={ArrowUpRight} tone="emerald" />
                <Metric title="Spent today" value={money(summary?.today_expense, baseCurrency)} icon={ArrowDownLeft} tone="rose" />
                <Metric title="Earned this month" value={money(summary?.monthly_income, baseCurrency)} icon={Banknote} tone="blue" />
                <Metric title={summary?.active_budgets ? 'Budget left' : 'Wallets'} value={summary?.active_budgets ? money(summary?.monthly_budget_remaining, baseCurrency) : accounts.length} icon={summary?.active_budgets ? Target : WalletCards} tone="amber" />
            </div>

            {summary?.active_budgets > 0 && (
                <Panel title="Monthly budget">
                    <div className="grid gap-4 lg:grid-cols-[1fr_220px] lg:items-center">
                        <div>
                            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                                <p className="font-semibold text-[#fff8ef]">{summary.monthly_budget_progress}% used</p>
                                <p className="text-[#d9c4ad]">{money(summary.monthly_budget_spent, baseCurrency)} spent of {money(summary.monthly_budget_amount, baseCurrency)}</p>
                            </div>
                            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#2a1a12]/70">
                                <div className={`h-full rounded-full ${summary.monthly_budget_progress > 100 ? 'bg-red-300' : summary.monthly_budget_progress >= 80 ? 'bg-[#f0a36f]' : 'bg-[#89e6ba]'}`} style={{ width: `${Math.min(100, Number(summary.monthly_budget_progress || 0))}%` }} />
                            </div>
                        </div>
                        <div className="rounded-md border border-[#8f633e]/45 bg-[#2a1a12]/45 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f2c38b]">Remaining</p>
                            <p className={`mt-1 text-xl font-semibold ${summary.monthly_budget_remaining < 0 ? 'text-red-100' : 'text-[#89e6ba]'}`}>{money(summary.monthly_budget_remaining, baseCurrency)}</p>
                        </div>
                    </div>
                </Panel>
            )}

            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                <div className="hidden xl:block">
                    <Panel title="Quick money record"><TransactionForm accounts={accounts} baseCurrency={baseCurrency} categories={categories} onCreated={onCreated} /></Panel>
                </div>
                <Panel title="Wallet balances">
                    <div className="space-y-3">
                        {accounts.length === 0 && <Empty text="Create your first cash wallet, ABA, Wing, or savings wallet." />}
                        {accounts.map((account) => <Row key={account.id} title={account.name} meta={`${account.type} / ${account.currency}`} value={money(account.current_balance, account.currency)} />)}
                    </div>
                </Panel>
            </div>

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
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} dataKey="total" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={4}>
                                        {categoryData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(value) => money(value, baseCurrency)} contentStyle={{ borderRadius: 8, borderColor: '#8f633e', background: '#3a251a', color: '#f8efe3' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <Empty text="Add spending records to see where money goes." />}
                    </ChartBox>
                </Panel>
            </div>
        </div>
    );
}
