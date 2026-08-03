import { useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownLeft, ArrowUpRight, Banknote, CalendarDays, WalletCards } from 'lucide-react';
import TransactionForm from '../components/TransactionForm.jsx';
import { Empty, Panel, TxRow, StatCard } from '../components/ui.jsx';
import { buildMonthlyData, money, shortDate } from '../lib/format.js';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';

export default function Dashboard({ summary, transactions, categories, accounts, onCreated }) {
    const monthlyData = useMemo(() => buildMonthlyData(transactions), [transactions]);
    const categoryData = summary?.spending_by_category?.map((item) => ({
        name: item.category?.name || 'Other',
        total: Number(item.total || 0),
        fill: item.category?.color || 'var(--chart-1)',
    })) || [];

    const sparkData = monthlyData.length ? monthlyData : [{ name: 'Start', income: 0, expense: 0 }];

    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
                <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background p-6">
                    <div className="flex flex-col justify-between h-full gap-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
                                    <CalendarDays className="size-3.5" />
                                    Live Financial Summary
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">Net Balance</p>
                                <h2 className="text-4xl font-extrabold tracking-tight mt-1">{money(summary?.current_balance)}</h2>
                            </div>
                            <div className="w-36 h-20 hidden sm:block">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sparkData}>
                                        <Area type="monotone" dataKey="income" stroke="var(--primary)" strokeWidth={2} fill="var(--primary)" fillOpacity={0.1} dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Earned</p>
                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{money(summary?.monthly_income)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Spent</p>
                                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{money(summary?.monthly_expense)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Left</p>
                                <p className="text-lg font-bold text-sky-600 dark:text-sky-400">{money(summary?.monthly_savings)}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Panel title="Recent Transactions">
                    <div className="flex flex-col gap-2.5">
                        {transactions.length === 0 && <Empty text="No transactions recorded yet." />}
                        {transactions.slice(0, 4).map((item) => (
                            <TxRow
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

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Earned today" value={money(summary?.today_income)} icon={ArrowUpRight} />
                <StatCard title="Spent today" value={money(summary?.today_expense)} icon={ArrowDownLeft} />
                <StatCard title="Earned this month" value={money(summary?.monthly_income)} icon={Banknote} />
                <StatCard title="Active Wallets" value={accounts.length} icon={WalletCards} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
                <Panel title="Record New Transaction">
                    <TransactionForm accounts={accounts} categories={categories} onCreated={onCreated} />
                </Panel>
                <Panel title="Wallet Balances">
                    <div className="flex flex-col gap-2.5">
                        {accounts.length === 0 && <Empty text="Create your first wallet to start tracking balances." />}
                        {accounts.map((account) => (
                            <TxRow
                                key={account.id}
                                title={account.name}
                                meta={`${account.type.toUpperCase()} · ${account.currency}`}
                                value={money(account.current_balance, account.currency)}
                            />
                        ))}
                    </div>
                </Panel>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Earned vs. Spent Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{ income: { label: 'Earned', color: 'var(--chart-1)' }, expense: { label: 'Spent', color: 'var(--chart-2)' } }} className="h-72 w-full">
                            <BarChart data={monthlyData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent formatter={(v) => money(v)} />} />
                                <Bar dataKey="income" name="Earned" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Spent" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Spending Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {categoryData.length ? (
                            <ChartContainer config={{}} className="h-72 w-full">
                                <PieChart>
                                    <Pie data={categoryData} dataKey="total" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent formatter={(v) => money(v)} />} />
                                </PieChart>
                            </ChartContainer>
                        ) : (
                            <div className="h-72 flex items-center justify-center">
                                <Empty text="Add spending records to see distribution." />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
