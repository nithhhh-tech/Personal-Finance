import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Loader2, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { api } from '../lib/api.js';
import { currentMonth, money, readError } from '../lib/format.js';
import { ChartBox, Empty, Panel } from '../components/ui.jsx';

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
            <section className="rounded-lg border border-[#8f633e]/45 bg-[#2a1a12] p-4 text-[#f8efe3] shadow-xl shadow-black/25 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Reports</p>
                        <h2 className="mt-2 text-xl font-bold sm:text-2xl">Month-to-month comparison</h2>
                        <p className="mt-1 text-sm text-[#d9c4ad]">Compare income, spending, savings, and categories against the previous month.</p>
                    </div>
                    <label className="block w-full text-sm font-semibold text-[#d9c4ad] sm:w-auto sm:min-w-56">
                        Month
                        <div className="mt-1 flex h-11 items-center gap-2 rounded-md border border-[#8f633e]/60 bg-[#3a251a]/80 px-3 focus-within:border-[#d7a86e] focus-within:ring-4 focus-within:ring-[#d7a86e]/15">
                            <CalendarDays size={17} className="text-[#f2c38b]" />
                            <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="w-full bg-transparent text-[#fff8ef] outline-none" />
                        </div>
                    </label>
                </div>
            </section>

            {error && <div className="rounded-md border border-red-300/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">{error}</div>}
            {loading && <div className="flex h-11 items-center gap-2 rounded-md border border-[#8f633e]/45 bg-[#3a251a]/85 px-4 text-sm text-[#d9c4ad]"><Loader2 size={16} className="animate-spin text-[#f2c38b]" />Loading report...</div>}

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
                            <ChartBox>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={report.daily_trend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#5f3e2a" />
                                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#d9c4ad', fontSize: 12 }} interval="preserveStartEnd" />
                                        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#d9c4ad', fontSize: 12 }} />
                                        <Tooltip formatter={(value) => money(value, baseCurrency)} contentStyle={{ borderRadius: 8, borderColor: '#8f633e', background: '#3a251a', color: '#f8efe3' }} />
                                        <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartBox>
                        </Panel>

                        <Panel title="Quick read">
                            <div className="space-y-3">
                                <InsightRow label="Selected month" value={report.month_label} />
                                <InsightRow label="Compared with" value={report.previous_month_label} />
                                <InsightRow label="Net change" value={money(report.comparison.savings.amount, baseCurrency)} tone={report.comparison.savings.amount >= 0 ? 'text-[#89e6ba]' : 'text-red-100'} />
                                <InsightRow label="Spend change" value={money(report.comparison.expense.amount, baseCurrency)} tone={report.comparison.expense.amount <= 0 ? 'text-[#89e6ba]' : 'text-[#f0a36f]'} />
                            </div>
                        </Panel>
                    </div>

                    <Panel title="Category spending comparison">
                        <div className="space-y-3">
                            {report.category_comparison.length === 0 && <Empty text="No category spending to compare yet." />}
                            {report.category_comparison.map((item) => <CategoryCompare key={item.category_id} baseCurrency={baseCurrency} item={item} />)}
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
        <div className="rounded-lg border border-[#8f633e]/45 bg-[#3a251a]/88 p-4 text-[#f8efe3] shadow-lg shadow-black/20 sm:p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#d9c4ad]">{title}</p>
                <div className={`flex size-10 items-center justify-center rounded-md ${isGood ? 'bg-[#244238] text-[#89e6ba]' : 'bg-[#513024] text-[#f0a36f]'}`}>
                    <Icon size={20} />
                </div>
            </div>
            <p className="mt-4 break-words text-xl font-semibold sm:text-2xl">{money(current, currency)}</p>
            <p className="mt-2 text-sm text-[#d9c4ad]">
                {positive ? '+' : ''}{money(change.amount, currency)} vs previous
                {change.percent !== null && <span> ({positive ? '+' : ''}{change.percent}%)</span>}
            </p>
            <p className="mt-1 text-xs text-[#b89a7f]">Previous: {money(previous, currency)}</p>
        </div>
    );
}

function CountMetric({ change, current, previous }) {
    const Icon = change.direction === 'up' ? TrendingUp : change.direction === 'down' ? TrendingDown : Minus;

    return (
        <div className="rounded-lg border border-[#8f633e]/45 bg-[#3a251a]/88 p-4 text-[#f8efe3] shadow-lg shadow-black/20 sm:p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#d9c4ad]">Records</p>
                <div className="flex size-10 items-center justify-center rounded-md bg-[#5a3d22] text-[#f2c38b]">
                    <Icon size={20} />
                </div>
            </div>
            <p className="mt-4 text-xl font-semibold sm:text-2xl">{current}</p>
            <p className="mt-2 text-sm text-[#d9c4ad]">{change.amount > 0 ? '+' : ''}{change.amount} vs previous</p>
            <p className="mt-1 text-xs text-[#b89a7f]">Previous: {previous}</p>
        </div>
    );
}

function InsightRow({ label, tone = 'text-[#fff8ef]', value }) {
    return (
        <div className="flex flex-col items-start gap-1 rounded-md border border-[#8f633e]/45 bg-[#2a1a12]/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <p className="text-sm text-[#d9c4ad]">{label}</p>
            <p className={`break-words font-semibold ${tone}`}>{value}</p>
        </div>
    );
}

function CategoryCompare({ baseCurrency, item }) {
    const max = Math.max(Number(item.current || 0), Number(item.previous || 0), 1);
    const currentWidth = Math.min(100, (Number(item.current || 0) / max) * 100);
    const previousWidth = Math.min(100, (Number(item.previous || 0) / max) * 100);
    const spentMore = item.difference > 0;

    return (
        <div className="rounded-md border border-[#8f633e]/45 bg-[#2a1a12]/45 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="font-semibold text-[#fff8ef]">{item.category?.name || 'Category'}</p>
                    <p className="mt-1 text-sm text-[#d9c4ad]">{spentMore ? 'Spent more' : item.difference < 0 ? 'Spent less' : 'No change'} by {money(Math.abs(item.difference), baseCurrency)}</p>
                </div>
                <p className={spentMore ? 'font-semibold text-[#f0a36f]' : 'font-semibold text-[#89e6ba]'}>
                    {spentMore ? '+' : item.difference < 0 ? '-' : ''}{money(Math.abs(item.difference), baseCurrency)}
                </p>
            </div>
            <div className="mt-4 space-y-2">
                <ComparisonBar label="This month" value={money(item.current, baseCurrency)} width={currentWidth} color="bg-[#d7a86e]" />
                <ComparisonBar label="Previous" value={money(item.previous, baseCurrency)} width={previousWidth} color="bg-[#8f633e]" />
            </div>
        </div>
    );
}

function ComparisonBar({ color, label, value, width }) {
    return (
        <div>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs font-semibold text-[#d9c4ad]">
                <span>{label}</span>
                <span className="text-right">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#3a251a]">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
            </div>
        </div>
    );
}
