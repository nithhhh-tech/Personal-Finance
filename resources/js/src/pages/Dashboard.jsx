import { useMemo } from 'react';
import {
    Area, AreaChart, Bar, BarChart, CartesianGrid,
    Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { ArrowDownLeft, ArrowUpRight, Banknote, CalendarDays, WalletCards } from 'lucide-react';
import TransactionForm from '../components/TransactionForm.jsx';
import { ChartBox, DarkStat, Empty, Metric, Panel, Row } from '../components/ui.jsx';
import { buildMonthlyData, coffeeColor, money, shortDate } from '../lib/format.js';

// Apple Tooltip
function MonoTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--apple-border)',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 12.5,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}>
            {label && <p style={{ color: 'var(--apple-sub)', marginBottom: 6, fontSize: 11, fontWeight: 600 }}>{label}</p>}
            {payload.map((p) => (
                <p key={p.dataKey} style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: p.color || 'var(--apple-dark)', marginBottom: 2 }}>
                    {p.name}: {money(p.value)}
                </p>
            ))}
        </div>
    );
}

export default function Dashboard({ summary, transactions, categories, accounts, onCreated }) {
    const monthlyData  = useMemo(() => buildMonthlyData(transactions), [transactions]);
    const categoryData = summary?.spending_by_category?.map((item) => ({
        name:  item.category?.name  || 'Other',
        total: Number(item.total    || 0),
        color: coffeeColor(item.category?.color || '#0071E3'),
    })) || [];

    const sparkData = monthlyData.length ? monthlyData : [{ name: 'Start', income: 0, expense: 0 }];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* ── Row 1: Apple Hero Banner + Recent ── */}
            <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr' }}>
                <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.65fr)' }} className="dash-hero-row">
                    {/* Hero Panel */}
                    <div className="hero-panel animate-fade-in-up">
                        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr auto', alignItems: 'start' }}>
                            <div>
                                <div className="hero-badge">
                                    <CalendarDays size={13} />
                                    Live Financial Summary
                                </div>
                                <p className="hero-label">Net Balance</p>
                                <p className="hero-balance">{money(summary?.current_balance)}</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 24 }}>
                                    <DarkStat label="Earned" value={money(summary?.monthly_income)}  color="text-emerald-300" />
                                    <DarkStat label="Spent"  value={money(summary?.monthly_expense)} color="text-rose-300" />
                                    <DarkStat label="Left"   value={money(summary?.monthly_savings)} color="text-sky-300" />
                                </div>
                            </div>
                            <div style={{ width: 200, height: 140, flexShrink: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sparkData}>
                                        <defs>
                                            <linearGradient id="coffeeIncomeFill" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%"   stopColor="#E6A15C" stopOpacity="0.6" />
                                                <stop offset="100%" stopColor="#E6A15C" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip content={<MonoTooltip />} />
                                        <Area type="monotone" dataKey="income" name="Earned" stroke="#E6A15C" strokeWidth={3} fill="url(#coffeeIncomeFill)" dot={false} isAnimationActive={true} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Recent Records */}
                    <Panel title="Recent Transactions" className="animate-delay-1">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {transactions.length === 0 && <Empty text="No transactions recorded yet." />}
                            {transactions.slice(0, 5).map((item) => (
                                <Row
                                    key={item.id}
                                    title={item.description || item.category?.name || 'Transaction'}
                                    meta={`${shortDate(item.transaction_date)} · ${item.account?.name || 'Wallet'}`}
                                    value={`${item.type === 'income' ? '+' : '−'}${money(item.base_amount)}`}
                                    tone={item.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}
                                />
                            ))}
                        </div>
                    </Panel>
                </div>
            </div>

            {/* ── Row 2: Apple Metric Cards ── */}
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(4, 1fr)' }} className="dash-metrics-row">
                <Metric title="Earned today"       value={money(summary?.today_income)}   icon={ArrowUpRight}  tone="emerald" />
                <Metric title="Spent today"        value={money(summary?.today_expense)}  icon={ArrowDownLeft} tone="rose" />
                <Metric title="Earned this month"  value={money(summary?.monthly_income)} icon={Banknote}      tone="blue" />
                <Metric title="Active Wallets"     value={accounts.length}                icon={WalletCards}   tone="amber" />
            </div>

            {/* ── Row 3: Transaction Form + Wallets ── */}
            <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(0, 1fr) 380px' }} className="dash-form-row">
                <Panel title="Record New Transaction">
                    <TransactionForm accounts={accounts} categories={categories} onCreated={onCreated} />
                </Panel>
                <Panel title="Wallet Balances">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {accounts.length === 0 && <Empty text="Create your first cash, ABA, Wing, or savings wallet." />}
                        {accounts.map((account) => (
                            <Row
                                key={account.id}
                                title={account.name}
                                meta={`${account.type} · ${account.currency}`}
                                value={money(account.current_balance)}
                            />
                        ))}
                    </div>
                </Panel>
            </div>

            {/* ── Row 4: Apple Motion Charts ── */}
            <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(2, 1fr)' }} className="dash-charts-row">
                <Panel title="Earned vs. Spent Comparison">
                    <ChartBox>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} barGap={6}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--apple-sub)' }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--apple-sub)' }} />
                                <Tooltip content={<MonoTooltip />} />
                                <Bar dataKey="income"  name="Earned" fill="#E6A15C" radius={[6, 6, 0, 0]} maxBarSize={34} isAnimationActive={true} />
                                <Bar dataKey="expense" name="Spent"  fill="#4E3629" radius={[6, 6, 0, 0]} maxBarSize={34} isAnimationActive={true} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartBox>
                </Panel>
                <Panel title="Spending Distribution">
                    <ChartBox>
                        {categoryData.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} dataKey="total" nameKey="name" innerRadius={76} outerRadius={112} paddingAngle={4} strokeWidth={0} isAnimationActive={true}>
                                        {categoryData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip content={<MonoTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <Empty text="Add spending records to see distribution." />}
                    </ChartBox>
                </Panel>
            </div>
        </div>
    );
}
