import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { ArrowDownLeft, ArrowUpRight, Banknote, WalletCards } from 'lucide-react';
import TransactionForm from '../components/TransactionForm.jsx';
import { Empty, Panel, StatCard, TxRow, PageHeader } from '../components/ui.jsx';
import { cn } from '@/lib/utils';
import { coffeeColor, buildMonthlyData, money, shortDate } from '../lib/format.js';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';

const spring = { type: 'spring', stiffness: 260, damping: 24 };
const fadeUp = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
};

const glass =
    'bg-[#fff9ec]/60 ring-black/5 backdrop-blur-2xl dark:bg-white/[0.04] dark:ring-white/10';
const glassRow = 'bg-[#fffdf5]/55 dark:bg-white/[0.03]';
const glow = 'pointer-events-none absolute rounded-full blur-3xl';

function EarnedSpent({ data }) {
    const max = useMemo(() => Math.max(1, ...data.map((d) => Math.max(Number(d.income) || 0, Number(d.expense) || 0))), [data]);
    const rows = data.slice(0, 8);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-chart-1" />Earned
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-chart-2" />Spent
                </span>
            </div>
            <div className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
                {rows.map((day) => {
                    const incomePct = ((Number(day.income) || 0) / max) * 100;
                    const expensePct = ((Number(day.expense) || 0) / max) * 100;
                    return (
                        <div key={day.name} className="flex items-center gap-3 text-xs">
                            <span className="w-12 shrink-0 font-medium tabular-nums text-muted-foreground">{day.name}</span>
                            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-chart-1/15">
                                        <motion.div
                                            className="h-full rounded-full bg-chart-1"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${incomePct}%` }}
                                            transition={spring}
                                        />
                                    </div>
                                    <span className="w-20 shrink-0 text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                                        {money(day.income)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-chart-2/15">
                                        <motion.div
                                            className="h-full rounded-full bg-chart-2"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${expensePct}%` }}
                                            transition={spring}
                                        />
                                    </div>
                                    <span className="w-20 shrink-0 text-right font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                                        {money(day.expense)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function Dashboard({ summary, transactions, categories, accounts, onCreated }) {
    const monthlyData = useMemo(() => buildMonthlyData(transactions), [transactions]);
    const categoryData = summary?.spending_by_category?.map((item) => ({
        name: item.category?.name || 'Other',
        total: Number(item.total || 0),
        fill: coffeeColor(item.category?.color) || 'var(--chart-1)',
    })) || [];

    const sparkData = monthlyData.length ? monthlyData : [{ name: 'Start', income: 0, expense: 0 }];

    const stats = [
        { title: 'Earned today', value: money(summary?.today_income), icon: ArrowUpRight, tone: 'emerald' },
        { title: 'Spent today', value: money(summary?.today_expense), icon: ArrowDownLeft, tone: 'rose' },
        { title: 'Earned this month', value: money(summary?.monthly_income), icon: Banknote, tone: 'sky' },
        { title: 'Active Wallets', value: accounts.length, icon: WalletCards, tone: 'violet' },
    ];

    return (
        <div className="relative flex flex-col gap-6">
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className={cn(glow, '-right-24 top-1/3 size-96 bg-chart-3/20 dark:bg-chart-3/15')} />
                <div className={cn(glow, '-bottom-24 left-1/3 size-80 bg-chart-5/20 dark:bg-chart-5/15')} />
            </div>

            <div className="relative z-10 flex flex-col gap-6">
                <PageHeader
                    title="Dashboard"
                    description="A quick view of your money, today and this month."
                />

                <motion.div variants={fadeUp} initial="initial" animate="animate" transition={spring}>
                    <Card className={cn('relative overflow-hidden rounded-sm shadow-lg shadow-primary/5', glass)}>
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent"
                        />
                        <CardContent className="relative flex flex-col gap-5">
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Net Balance</p>
                                    <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">
                                        {money(summary?.current_balance)}
                                    </p>
                                </div>
                                <div className="hidden h-16 w-44 sm:block">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={sparkData}>
                                            <defs>
                                                <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="income" stroke="var(--primary)" strokeWidth={2} fill="url(#sparkline-fill)" dot={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 border-t border-white/30 pt-4 dark:border-white/10">
                                <div>
                                    <p className="text-xs text-muted-foreground">Earned this month</p>
                                    <p className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                                        {money(summary?.monthly_income)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Spent this month</p>
                                    <p className="mt-0.5 text-lg font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                                        {money(summary?.monthly_expense)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Left to spend</p>
                                    <p className="mt-0.5 text-lg font-semibold tabular-nums">
                                        {money(summary?.monthly_savings)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            variants={fadeUp}
                            initial="initial"
                            animate="animate"
                            transition={{ ...spring, delay: 0.05 + index * 0.05 }}
                        >
                            <StatCard {...stat} className={glass} />
                        </motion.div>
                    ))}
                </div>

                <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
                    <div className="flex min-w-0 flex-1 flex-col gap-6">
                        <motion.div variants={fadeUp} initial="initial" animate="animate" transition={{ ...spring, delay: 0.15 }}>
                            <Panel title="Recent Transactions" className={glass}>
                                <div className="flex flex-col gap-2.5">
                                    {transactions.length === 0 && <Empty text="No transactions recorded yet." />}
                                    {transactions.slice(0, 4).map((item) => (
                                        <TxRow
                                            key={item.id}
                                            title={item.description || item.category?.name || 'Transaction'}
                                            meta={`${shortDate(item.transaction_date)} · ${item.account?.name || 'Wallet'}`}
                                            value={`${item.type === 'income' ? '+' : '−'}${money(item.base_amount)}`}
                                            tone={item.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}
                                            className={glassRow}
                                        />
                                    ))}
                                </div>
                            </Panel>
                        </motion.div>

                        <motion.div variants={fadeUp} initial="initial" animate="animate" transition={{ ...spring, delay: 0.25 }} className="flex-1">
                            <Panel title="Wallet Balances" className={cn(glass, 'h-full')}>
                                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                                    {accounts.length === 0 && <Empty text="Create your first wallet to start tracking balances." />}
                                    {accounts.map((account) => (
                                        <TxRow
                                            key={account.id}
                                            title={account.name}
                                            meta={`${account.type.toUpperCase()} · ${account.currency}`}
                                            value={money(account.current_balance, account.currency)}
                                            className={glassRow}
                                        />
                                    ))}
                                </div>
                            </Panel>
                        </motion.div>
                    </div>

                    <motion.div variants={fadeUp} initial="initial" animate="animate" transition={{ ...spring, delay: 0.2 }} className="lg:w-[400px] lg:shrink-0">
                        <Panel title="Record New Transaction" className={cn(glass, 'h-full')}>
                            <TransactionForm accounts={accounts} categories={categories} onCreated={onCreated} />
                        </Panel>
                    </motion.div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <motion.div variants={fadeUp} initial="initial" animate="animate" transition={{ ...spring, delay: 0.3 }} className="min-w-0">
                        <Card className={cn('h-full rounded-sm shadow-lg shadow-primary/5', glass)}>
                            <CardHeader>
                                <CardTitle>Earned vs. Spent</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {monthlyData.length ? (
                                    <EarnedSpent data={monthlyData} />
                                ) : (
                                    <div className="flex h-64 items-center justify-center">
                                        <Empty text="Add transactions to see the comparison." />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={fadeUp} initial="initial" animate="animate" transition={{ ...spring, delay: 0.35 }} className="min-w-0">
                        <Card className={cn('h-full rounded-sm shadow-lg shadow-primary/5', glass)}>
                            <CardHeader>
                                <CardTitle>Spending Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {categoryData.length ? (
                                    <div className="flex flex-col gap-4">
                                        <ChartContainer config={{}} className="aspect-auto h-56 w-full min-w-0">
                                            <PieChart>
                                                <Pie
                                                    data={categoryData}
                                                    dataKey="total"
                                                    nameKey="name"
                                                    innerRadius={55}
                                                    outerRadius={80}
                                                    paddingAngle={2}
                                                >
                                                    {categoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <ChartTooltip content={<ChartTooltipContent formatter={(v) => money(v)} />} />
                                            </PieChart>
                                        </ChartContainer>
                                        <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto pr-1">
                                            {categoryData.map((entry) => (
                                                <div key={entry.name} className="flex items-center justify-between gap-3 text-xs">
                                                    <span className="flex min-w-0 items-center gap-2">
                                                        <span className="size-2.5 shrink-0 rounded-full" style={{ background: entry.fill }} />
                                                        <span className="truncate text-muted-foreground">{entry.name}</span>
                                                    </span>
                                                    <span className="shrink-0 font-semibold tabular-nums text-foreground">
                                                        {money(entry.total)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-64 items-center justify-center">
                                        <Empty text="Add spending records to see distribution." />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
