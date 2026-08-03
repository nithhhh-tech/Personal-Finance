import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Loader2, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { api } from '../lib/api.js';
import { currentMonth, money, readError } from '../lib/format.js';
import { Empty, Panel } from '../components/ui.jsx';
import { Alert, AlertDescription } from '../components/ui/alert.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart.jsx';

export default function Reports({ baseCurrency }) {
    const [month, setMonth] = useState(currentMonth);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadReport();
    }, [month]);

    async function loadReport() {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/reports/monthly', { params: { month } });
            setReport(response.data);
        } catch (err) {
            setError(readError(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-sm bg-card px-5 py-5 ring-1 ring-foreground/5 sm:px-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Reports</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">Month-to-month comparison</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Compare income, spending, savings, and categories against the previous month.
                    </p>
                </div>
                <div className="w-full sm:w-auto">
                    <Label htmlFor="report-month">Month</Label>
                    <div className="relative mt-2">
                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="report-month"
                            type="month"
                            value={month}
                            onChange={(event) => setMonth(event.target.value)}
                            className="pl-9 sm:w-52"
                        />
                    </div>
                </div>
            </section>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading report...
                </div>
            )}

            {report && (
                <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <ReportMetric title="Income" current={report.current.income} previous={report.previous.income} change={report.comparison.income} currency={baseCurrency} goodWhenDown={false} />
                        <ReportMetric title="Spending" current={report.current.expense} previous={report.previous.expense} change={report.comparison.expense} currency={baseCurrency} goodWhenDown />
                        <ReportMetric title="Savings" current={report.current.savings} previous={report.previous.savings} change={report.comparison.savings} currency={baseCurrency} goodWhenDown={false} />
                        <CountMetric current={report.current.transaction_count} previous={report.previous.transaction_count} change={report.comparison.transaction_count} />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                        <Panel title={`${report.month_label} daily flow`}>
                            <ChartContainer
                                config={{
                                    income: { label: 'Earned', color: 'var(--chart-2)' },
                                    expense: { label: 'Spent', color: 'var(--chart-3)' },
                                }}
                                className="h-72 w-full"
                            >
                                <BarChart data={report.daily_trend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                    <YAxis tickLine={false} axisLine={false} />
                                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => money(value, baseCurrency)} />} />
                                    <Bar dataKey="income" name="Earned" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" name="Spent" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </Panel>

                        <Panel title="Quick read">
                            <div className="space-y-3">
                                <InsightRow label="Selected month" value={report.month_label} />
                                <InsightRow label="Compared with" value={report.previous_month_label} />
                                <InsightRow
                                    label="Net change"
                                    value={money(report.comparison.savings.amount, baseCurrency)}
                                    tone={report.comparison.savings.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}
                                />
                                <InsightRow
                                    label="Spend change"
                                    value={money(report.comparison.expense.amount, baseCurrency)}
                                    tone={report.comparison.expense.amount <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}
                                />
                            </div>
                        </Panel>
                    </div>

                    <Panel title="Category spending comparison">
                        <div className="space-y-3">
                            {report.category_comparison.length === 0 && <Empty text="No category spending to compare yet." />}
                            {report.category_comparison.map((item) => (
                                <CategoryCompare key={item.category_id} baseCurrency={baseCurrency} item={item} />
                            ))}
                        </div>
                    </Panel>
                </>
            )}
        </div>
    );
}

function ReportMetric({ change, currency, current, goodWhenDown, previous, title }) {
    const positive = change.amount > 0;
    const isGood = goodWhenDown ? change.amount <= 0 : change.amount >= 0;
    const Icon = change.direction === 'up' ? ArrowUpRight : change.direction === 'down' ? ArrowDownLeft : Minus;

    return (
        <div className="rounded-sm bg-card p-5 ring-1 ring-foreground/5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <span className={`flex size-10 items-center justify-center rounded-sm ${isGood ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                    <Icon className="size-5" />
                </span>
            </div>
            <p className="mt-4 break-words text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                {money(current, currency)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
                {positive ? '+' : ''}
                {money(change.amount, currency)} vs previous
                {change.percent !== null && <span> ({positive ? '+' : ''}{change.percent}%)</span>}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Previous: {money(previous, currency)}</p>
        </div>
    );
}

function CountMetric({ change, current, previous }) {
    const Icon = change.direction === 'up' ? TrendingUp : change.direction === 'down' ? TrendingDown : Minus;

    return (
        <div className="rounded-sm bg-card p-5 ring-1 ring-foreground/5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Records</p>
                <span className="flex size-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </span>
            </div>
            <p className="mt-4 text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">{current}</p>
            <p className="mt-2 text-sm text-muted-foreground">
                {change.amount > 0 ? '+' : ''}
                {change.amount} vs previous
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Previous: {previous}</p>
        </div>
    );
}

function InsightRow({ label, tone = 'text-foreground', value }) {
    return (
        <div className="flex flex-col items-start gap-1 rounded-sm bg-card px-4 py-3 ring-1 ring-foreground/5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`break-words font-semibold tabular-nums ${tone}`}>{value}</p>
        </div>
    );
}

function CategoryCompare({ baseCurrency, item }) {
    const max = Math.max(Number(item.current || 0), Number(item.previous || 0), 1);
    const currentWidth = Math.min(100, (Number(item.current || 0) / max) * 100);
    const previousWidth = Math.min(100, (Number(item.previous || 0) / max) * 100);
    const spentMore = item.difference > 0;

    return (
        <div className="rounded-sm bg-card px-4 py-4 ring-1 ring-foreground/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="font-semibold">{item.category?.name || 'Category'}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {spentMore ? 'Spent more' : item.difference < 0 ? 'Spent less' : 'No change'} by{' '}
                        {money(Math.abs(item.difference), baseCurrency)}
                    </p>
                </div>
                <p className={spentMore ? 'font-semibold text-amber-600 dark:text-amber-400' : 'font-semibold text-emerald-600 dark:text-emerald-400'}>
                    {spentMore ? '+' : item.difference < 0 ? '-' : ''}
                    {money(Math.abs(item.difference), baseCurrency)}
                </p>
            </div>
            <div className="mt-4 space-y-2">
                <ComparisonBar label="This month" value={money(item.current, baseCurrency)} width={currentWidth} color="bg-primary" />
                <ComparisonBar label="Previous" value={money(item.previous, baseCurrency)} width={previousWidth} color="bg-muted-foreground/40" />
            </div>
        </div>
    );
}

function ComparisonBar({ color, label, value, width }) {
    return (
        <div>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs font-semibold text-muted-foreground">
                <span>{label}</span>
                <span className="text-right tabular-nums">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
            </div>
        </div>
    );
}
