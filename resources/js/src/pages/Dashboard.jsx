import { useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownLeft, ArrowUpRight, Banknote, CalendarDays, WalletCards } from 'lucide-react';
import TransactionForm from '../components/TransactionForm.jsx';
import { ChartBox, DarkStat, Empty, Metric, Panel, Row } from '../components/ui.jsx';
import { buildMonthlyData, money, shortDate } from '../lib/format.js';

export default function Dashboard({ summary, transactions, categories, accounts, onCreated }) {
    const monthlyData = useMemo(() => buildMonthlyData(transactions), [transactions]);
    const categoryData = summary?.spending_by_category?.map((item) => ({
        name: item.category?.name || 'Other',
        total: Number(item.total || 0),
        color: item.category?.color || '#64748b',
    })) || [];
    const sparkData = monthlyData.length ? monthlyData : [{ name: 'Start', income: 0, expense: 0 }];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                <section className="overflow-hidden rounded-lg border border-[#8f633e]/45 bg-[#2a1a12] text-[#f8efe3] shadow-xl shadow-black/25">
                    <div className="grid gap-6 p-6 md:grid-cols-[1fr_260px]">
                        <div>
                            <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-[#8f633e]/45 bg-[#3a251a] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">
                                <CalendarDays size={14} />
                                Live overview
                            </div>
                            <p className="text-sm text-[#d9c4ad]">Money left</p>
                            <p className="mt-2 text-5xl font-bold tracking-normal">{money(summary?.current_balance)}</p>
                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <DarkStat label="Earned" value={money(summary?.monthly_income)} color="text-emerald-300" />
                                <DarkStat label="Spent" value={money(summary?.monthly_expense)} color="text-rose-300" />
                                <DarkStat label="Left" value={money(summary?.monthly_savings)} color="text-sky-300" />
                            </div>
                        </div>
                        <div className="h-48 min-h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sparkData}>
                                    <defs>
                                        <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#34d399" stopOpacity="0.55" />
                                            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip formatter={(value) => money(value)} contentStyle={{ borderRadius: 8, border: '1px solid #8f633e', background: '#3a251a', color: '#f8efe3' }} />
                                    <Area type="monotone" dataKey="income" stroke="#34d399" strokeWidth={3} fill="url(#incomeFill)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>
                <Panel title="Recent money records">
                    <div className="space-y-3">
                        {transactions.length === 0 && <Empty text="Add your first money record." />}
                        {transactions.slice(0, 5).map((item) => (
                            <Row key={item.id} title={item.description || item.category?.name || 'Transaction'} meta={`${shortDate(item.transaction_date)} / ${item.account?.name || 'Wallet'}`} value={`${item.type === 'income' ? '+' : '-'}${money(item.base_amount)}`} tone={item.type === 'income' ? 'text-[#89e6ba]' : 'text-[#f0a36f]'} />
                        ))}
                    </div>
                </Panel>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Metric title="Earned today" value={money(summary?.today_income)} icon={ArrowUpRight} tone="emerald" />
                <Metric title="Spent today" value={money(summary?.today_expense)} icon={ArrowDownLeft} tone="rose" />
                <Metric title="Earned this month" value={money(summary?.monthly_income)} icon={Banknote} tone="blue" />
                <Metric title="Wallets" value={accounts.length} icon={WalletCards} tone="amber" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                <Panel title="Quick money record"><TransactionForm accounts={accounts} categories={categories} onCreated={onCreated} /></Panel>
                <Panel title="Wallet balances">
                    <div className="space-y-3">
                        {accounts.length === 0 && <Empty text="Create your first cash wallet, ABA, Wing, or savings wallet." />}
                        {accounts.map((account) => <Row key={account.id} title={account.name} meta={`${account.type} / ${account.currency}`} value={money(account.current_balance)} />)}
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
                                <Tooltip formatter={(value) => money(value)} contentStyle={{ borderRadius: 8, borderColor: '#8f633e', background: '#3a251a', color: '#f8efe3' }} />
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
                                    <Tooltip formatter={(value) => money(value)} contentStyle={{ borderRadius: 8, borderColor: '#8f633e', background: '#3a251a', color: '#f8efe3' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <Empty text="Add spending records to see where money goes." />}
                    </ChartBox>
                </Panel>
            </div>
        </div>
    );
}
