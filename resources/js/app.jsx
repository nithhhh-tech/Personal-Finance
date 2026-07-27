import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownLeft, ArrowUpRight, Banknote, CalendarDays, Folder, LayoutDashboard, LogOut, Plus, ReceiptText, RefreshCw, Search, ShieldCheck, WalletCards } from 'lucide-react';
import '../css/app.css';

const api = axios.create({ baseURL: '/api', headers: { Accept: 'application/json' } });
const money = (value) => `$${Number(value || 0).toFixed(2)}`;
const today = new Date().toISOString().slice(0, 10);

function App() {
    const [token, setToken] = useState(localStorage.getItem('pocketledger_token'));
    const [user, setUser] = useState(null);
    const [summary, setSummary] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [activeView, setActiveView] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState('');

    useEffect(() => {
        api.defaults.headers.common.Authorization = token ? `Bearer ${token}` : '';
        if (token) loadAll();
    }, [token]);

    async function loadAll() {
        setLoading(true);
        setNotice('');
        try {
            const [meRes, summaryRes, accountsRes, categoriesRes, transactionsRes] = await Promise.all([
                api.get('/me'),
                api.get('/dashboard/summary'),
                api.get('/accounts'),
                api.get('/categories'),
                api.get('/transactions'),
            ]);
            setUser(meRes.data);
            setSummary(summaryRes.data);
            setAccounts(accountsRes.data);
            setCategories(categoriesRes.data);
            setTransactions(transactionsRes.data.data || transactionsRes.data);
        } catch (error) {
            if (error.response?.status === 401) logout(false);
            else setNotice(readError(error));
        } finally {
            setLoading(false);
        }
    }

    function saveToken(nextToken) {
        localStorage.setItem('pocketledger_token', nextToken);
        setToken(nextToken);
    }

    async function logout(callApi = true) {
        if (callApi && token) await api.post('/logout').catch(() => {});
        localStorage.removeItem('pocketledger_token');
        setToken(null);
        setUser(null);
    }

    if (!token) return <AuthScreen onAuthed={saveToken} />;

    return (
        <div className="min-h-screen bg-[#eef2f6] text-slate-950">
            <aside className="fixed inset-y-0 left-0 hidden w-72 bg-[#111827] text-white lg:block">
                <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
                    <div className="flex size-11 items-center justify-center rounded-lg bg-[#2fbf71] text-white shadow-lg shadow-emerald-950/30"><WalletCards size={24} /></div>
                    <div>
                        <p className="text-lg font-semibold">PocketLedger</p>
                        <p className="text-xs text-slate-400">Personal Finance</p>
                    </div>
                </div>
                <nav className="space-y-2 p-4">
                    <NavButton icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                    <NavButton icon={ReceiptText} label="Transactions" active={activeView === 'transactions'} onClick={() => setActiveView('transactions')} />
                    <NavButton icon={WalletCards} label="Accounts" active={activeView === 'accounts'} onClick={() => setActiveView('accounts')} />
                    <NavButton icon={Folder} label="Categories" active={activeView === 'categories'} onClick={() => setActiveView('categories')} />
                </nav>
                <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-5">
                    <div className="rounded-lg bg-white/[0.06] p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">This Month</p>
                        <p className="mt-2 text-2xl font-semibold">{money(summary?.monthly_savings)}</p>
                        <p className="mt-1 text-xs text-slate-400">Income minus expenses</p>
                    </div>
                </div>
            </aside>

            <main className="lg:pl-72">
                <header className="sticky top-0 z-20 flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur-xl lg:px-8">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Welcome back, {user?.name || 'friend'}</p>
                        <h1 className="text-2xl font-semibold tracking-normal">{viewTitle(activeView)}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={loadAll} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold shadow-sm hover:bg-slate-50"><RefreshCw size={16} />Refresh</button>
                        <button onClick={() => logout()} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#111827] px-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"><LogOut size={16} />Logout</button>
                    </div>
                </header>

                <div className="block border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
                    <div className="grid grid-cols-4 gap-2">
                        <MiniNav icon={LayoutDashboard} active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                        <MiniNav icon={ReceiptText} active={activeView === 'transactions'} onClick={() => setActiveView('transactions')} />
                        <MiniNav icon={WalletCards} active={activeView === 'accounts'} onClick={() => setActiveView('accounts')} />
                        <MiniNav icon={Folder} active={activeView === 'categories'} onClick={() => setActiveView('categories')} />
                    </div>
                </div>

                <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
                    {notice && <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">{notice}</div>}
                    {loading && <div className="mb-4 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">Loading latest finance data...</div>}
                    {activeView === 'dashboard' && <Dashboard summary={summary} transactions={transactions} categories={categories} accounts={accounts} onCreated={loadAll} />}
                    {activeView === 'transactions' && <Transactions transactions={transactions} accounts={accounts} categories={categories} onCreated={loadAll} />}
                    {activeView === 'accounts' && <Accounts accounts={accounts} onCreated={loadAll} />}
                    {activeView === 'categories' && <Categories categories={categories} onCreated={loadAll} />}
                </section>
            </main>
        </div>
    );
}

function AuthScreen({ onAuthed }) {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '', base_currency: 'USD' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function submit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const endpoint = mode === 'login' ? '/login' : '/register';
            const payload = mode === 'login' ? { email: form.email, password: form.password } : form;
            const response = await api.post(endpoint, payload);
            onAuthed(response.data.token);
        } catch (err) {
            setError(readError(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#edf2f6] px-4 py-8 text-slate-950">
            <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_440px]">
                <section className="space-y-7">
                    <div className="inline-flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-[#111827] text-white"><WalletCards size={26} /></div>
                        <div>
                            <h1 className="text-4xl font-semibold tracking-normal">PocketLedger</h1>
                            <p className="text-slate-500">Daily money, monthly clarity.</p>
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Current balance</p>
                                <p className="text-3xl font-semibold">$1,284.50</p>
                            </div>
                            <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">+12.4%</div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <PreviewStat label="Income" value="$620" tone="emerald" />
                            <PreviewStat label="Expenses" value="$238" tone="rose" />
                            <PreviewStat label="Savings" value="$382" tone="blue" />
                        </div>
                        <div className="mt-5 grid gap-3">
                            <PreviewRow title="Lunch at work" meta="Food / ABA" value="-$5.50" tone="text-rose-700" />
                            <PreviewRow title="Freelance payment" meta="Income / Bank" value="+$120.00" tone="text-emerald-700" />
                            <PreviewRow title="Gasoline" meta="Transport / Cash" value="-$8.00" tone="text-rose-700" />
                        </div>
                    </div>
                </section>

                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                    <div className="mb-6 flex rounded-md bg-slate-100 p-1">
                        <button type="button" onClick={() => setMode('login')} className={`flex-1 rounded px-3 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>Login</button>
                        <button type="button" onClick={() => setMode('register')} className={`flex-1 rounded px-3 py-2 text-sm font-semibold ${mode === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>Register</button>
                    </div>
                    <div className="space-y-4">
                        {mode === 'register' && <Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />}
                        <Input label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
                        <Input label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
                        {mode === 'register' && <Select label="Base currency" value={form.base_currency} onChange={(base_currency) => setForm({ ...form, base_currency })} options={[["USD", "USD"], ["KHR", "KHR"]]} />}
                    </div>
                    {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                    <button disabled={submitting} className="mt-6 h-12 w-full rounded-md bg-[#2fbf71] px-4 font-semibold text-white shadow-lg shadow-emerald-200 hover:bg-[#269f60] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}</button>
                    <div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={15} />Protected by Laravel Sanctum tokens</div>
                </form>
            </div>
        </main>
    );
}

function Dashboard({ summary, transactions, categories, accounts, onCreated }) {
    const monthlyData = useMemo(() => buildMonthlyData(transactions), [transactions]);
    const categoryData = summary?.spending_by_category?.map((item) => ({ name: item.category?.name || 'Other', total: Number(item.total || 0), color: item.category?.color || '#64748b' })) || [];
    const sparkData = monthlyData.length ? monthlyData : [{ name: 'Start', income: 0, expense: 0 }];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                <section className="overflow-hidden rounded-lg bg-[#111827] text-white shadow-xl shadow-slate-300/60">
                    <div className="grid gap-6 p-6 md:grid-cols-[1fr_260px]">
                        <div>
                            <div className="mb-6 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300"><CalendarDays size={14} />Live overview</div>
                            <p className="text-sm text-slate-400">Current balance</p>
                            <p className="mt-2 text-5xl font-semibold tracking-normal">{money(summary?.current_balance)}</p>
                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <DarkStat label="Income" value={money(summary?.monthly_income)} color="text-emerald-300" />
                                <DarkStat label="Expenses" value={money(summary?.monthly_expense)} color="text-rose-300" />
                                <DarkStat label="Savings" value={money(summary?.monthly_savings)} color="text-sky-300" />
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
                                    <Tooltip formatter={(value) => money(value)} contentStyle={{ borderRadius: 8, border: '0' }} />
                                    <Area type="monotone" dataKey="income" stroke="#34d399" strokeWidth={3} fill="url(#incomeFill)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>
                <Panel title="Recent transactions">
                    <div className="space-y-3">
                        {transactions.length === 0 && <Empty text="Add your first transaction." />}
                        {transactions.slice(0, 5).map((item) => <Row key={item.id} title={item.description || item.category?.name || 'Transaction'} meta={`${shortDate(item.transaction_date)} / ${item.account?.name || 'Account'}`} value={`${item.type === 'income' ? '+' : '-'}${money(item.base_amount)}`} tone={item.type === 'income' ? 'text-emerald-700' : 'text-rose-700'} />)}
                    </div>
                </Panel>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Metric title="Today income" value={money(summary?.today_income)} icon={ArrowUpRight} tone="emerald" />
                <Metric title="Today expense" value={money(summary?.today_expense)} icon={ArrowDownLeft} tone="rose" />
                <Metric title="Monthly income" value={money(summary?.monthly_income)} icon={Banknote} tone="blue" />
                <Metric title="Accounts" value={accounts.length} icon={WalletCards} tone="amber" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                <Panel title="Quick transaction"><TransactionForm accounts={accounts} categories={categories} onCreated={onCreated} /></Panel>
                <Panel title="Account balances"><div className="space-y-3">{accounts.length === 0 && <Empty text="Create your first wallet or bank account." />}{accounts.map((account) => <Row key={account.id} title={account.name} meta={`${account.type} / ${account.currency}`} value={money(account.current_balance)} />)}</div></Panel>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <Panel title="Income vs expense"><ChartBox><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip formatter={(value) => money(value)} contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0' }} /><Bar dataKey="income" fill="#22c55e" radius={[5, 5, 0, 0]} /><Bar dataKey="expense" fill="#f43f5e" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></ChartBox></Panel>
                <Panel title="Spending by category"><ChartBox>{categoryData.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="total" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={4}>{categoryData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => money(value)} contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0' }} /></PieChart></ResponsiveContainer> : <Empty text="Add expenses to see category insights." />}</ChartBox></Panel>
            </div>
        </div>
    );
}

function Transactions({ transactions, accounts, categories, onCreated }) {
    const [search, setSearch] = useState('');
    const filtered = transactions.filter((item) => (item.description || '').toLowerCase().includes(search.toLowerCase()) || item.category?.name?.toLowerCase().includes(search.toLowerCase()));
    return (
        <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
            <Panel title="Add transaction"><TransactionForm accounts={accounts} categories={categories} onCreated={onCreated} /></Panel>
            <Panel title="Transaction history">
                <div className="mb-4 flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3">
                    <Search size={18} className="text-slate-400" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions" className="w-full bg-transparent outline-none" />
                </div>
                <div className="space-y-3">{filtered.length === 0 && <Empty text="No transactions yet." />}{filtered.map((item) => <Row key={item.id} title={item.description || item.category?.name || 'Transaction'} meta={`${shortDate(item.transaction_date)} / ${item.account?.name || 'Account'} / ${item.category?.name || 'Category'}`} value={`${item.type === 'income' ? '+' : '-'}${money(item.base_amount)}`} tone={item.type === 'income' ? 'text-emerald-700' : 'text-rose-700'} />)}</div>
            </Panel>
        </div>
    );
}

function Accounts({ accounts, onCreated }) {
    const [form, setForm] = useState({ name: '', type: 'cash', currency: 'USD', starting_balance: 0 });
    return <CrudPanel title="New account" onSubmit={async () => { await api.post('/accounts', form); setForm({ name: '', type: 'cash', currency: 'USD', starting_balance: 0 }); onCreated(); }} fields={<><Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} /><Select label="Type" value={form.type} onChange={(type) => setForm({ ...form, type })} options={[["cash", "Cash"], ["bank", "Bank"], ["wallet", "Wallet"], ["savings", "Savings"]]} /><Select label="Currency" value={form.currency} onChange={(currency) => setForm({ ...form, currency })} options={[["USD", "USD"], ["KHR", "KHR"]]} /><Input label="Starting balance" type="number" value={form.starting_balance} onChange={(starting_balance) => setForm({ ...form, starting_balance })} /></>} listTitle="Accounts" items={accounts.map((account) => ({ id: account.id, title: account.name, meta: `${account.type} / ${account.currency}`, value: money(account.current_balance) }))} />;
}

function Categories({ categories, onCreated }) {
    const [form, setForm] = useState({ name: '', type: 'expense', color: '#2563eb' });
    return <CrudPanel title="New category" onSubmit={async () => { await api.post('/categories', form); setForm({ name: '', type: 'expense', color: '#2563eb' }); onCreated(); }} fields={<><Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} /><Select label="Type" value={form.type} onChange={(type) => setForm({ ...form, type })} options={[["expense", "Expense"], ["income", "Income"]]} /><Input label="Color" type="color" value={form.color} onChange={(color) => setForm({ ...form, color })} /></>} listTitle="Categories" items={categories.map((category) => ({ id: category.id, title: category.name, meta: category.type, value: category.color }))} />;
}

function TransactionForm({ accounts, categories, onCreated }) {
    const [form, setForm] = useState({ type: 'expense', account_id: '', category_id: '', amount: '', currency: 'USD', exchange_rate: 1, transaction_date: today, payment_method: '', description: '' });
    const [error, setError] = useState('');
    const availableCategories = categories.filter((category) => category.type === form.type);

    useEffect(() => { if (!form.account_id && accounts[0]) setForm((current) => ({ ...current, account_id: accounts[0].id })); }, [accounts]);
    useEffect(() => { const first = availableCategories[0]; if (first && !availableCategories.some((category) => String(category.id) === String(form.category_id))) setForm((current) => ({ ...current, category_id: first.id })); }, [form.type, categories]);

    async function submit(event) {
        event.preventDefault();
        setError('');
        try {
            await api.post('/transactions', form);
            setForm({ ...form, amount: '', description: '', transaction_date: today });
            onCreated();
        } catch (err) {
            setError(readError(err));
        }
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            {accounts.length === 0 && <Empty text="Add an account before recording transactions." />}
            <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Type" value={form.type} onChange={(type) => setForm({ ...form, type, category_id: '' })} options={[["expense", "Expense"], ["income", "Income"]]} />
                <Input label="Amount" type="number" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
                <Select label="Account" value={form.account_id} onChange={(account_id) => setForm({ ...form, account_id })} options={accounts.map((account) => [account.id, account.name])} />
                <Select label="Category" value={form.category_id} onChange={(category_id) => setForm({ ...form, category_id })} options={availableCategories.map((category) => [category.id, category.name])} />
                <Input label="Date" type="date" value={form.transaction_date} onChange={(transaction_date) => setForm({ ...form, transaction_date })} />
                <Input label="Payment method" value={form.payment_method} onChange={(payment_method) => setForm({ ...form, payment_method })} />
            </div>
            <label className="block text-sm font-semibold text-slate-700">Note<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 min-h-24 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-[#2fbf71] focus:bg-white focus:ring-4 focus:ring-emerald-100" /></label>
            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button disabled={accounts.length === 0} className="inline-flex h-11 items-center gap-2 rounded-md bg-[#2fbf71] px-4 font-semibold text-white shadow-lg shadow-emerald-200 hover:bg-[#269f60] disabled:cursor-not-allowed disabled:opacity-50"><Plus size={18} />Save transaction</button>
        </form>
    );
}

function CrudPanel({ title, fields, onSubmit, listTitle, items }) {
    const [error, setError] = useState('');
    async function submit(event) { event.preventDefault(); setError(''); try { await onSubmit(); } catch (err) { setError(readError(err)); } }
    return <div className="grid gap-6 xl:grid-cols-[400px_1fr]"><Panel title={title}><form onSubmit={submit} className="space-y-4">{fields}{error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<button className="inline-flex h-11 items-center gap-2 rounded-md bg-[#2fbf71] px-4 font-semibold text-white shadow-lg shadow-emerald-200 hover:bg-[#269f60]"><Plus size={18} />Create</button></form></Panel><Panel title={listTitle}><div className="space-y-3">{items.length === 0 && <Empty text="Nothing here yet." />}{items.map((item) => <Row key={item.id} title={item.title} meta={item.meta} value={item.value} />)}</div></Panel></div>;
}

function Panel({ title, children }) { return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70"><div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold">{title}</h2></div>{children}</section>; }
function ChartBox({ children }) { return <div className="h-72 min-h-72 w-full">{children}</div>; }
function Empty({ text }) { return <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{text}</div>; }
function NavButton({ icon: Icon, label, active, onClick }) { return <button onClick={onClick} className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition ${active ? 'bg-white text-[#111827]' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}><Icon size={18} />{label}</button>; }
function MiniNav({ icon: Icon, active, onClick }) { return <button onClick={onClick} className={`flex h-11 items-center justify-center rounded-md ${active ? 'bg-[#111827] text-white' : 'bg-slate-100 text-slate-600'}`}><Icon size={18} /></button>; }
function PreviewStat({ label, value, tone }) { const colors = { emerald: 'text-emerald-700 bg-emerald-50', rose: 'text-rose-700 bg-rose-50', blue: 'text-blue-700 bg-blue-50' }; return <div className={`rounded-md px-3 py-3 ${colors[tone]}`}><p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>; }
function PreviewRow({ title, meta, value, tone }) { return <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-3"><div><p className="font-medium">{title}</p><p className="text-sm text-slate-500">{meta}</p></div><p className={`font-semibold ${tone}`}>{value}</p></div>; }
function DarkStat({ label, value, color }) { return <div className="rounded-md bg-white/10 p-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p><p className={`mt-1 text-lg font-semibold ${color}`}>{value}</p></div>; }
function Metric({ title, value, icon: Icon, tone }) { const colors = { emerald: 'bg-emerald-50 text-emerald-700', blue: 'bg-blue-50 text-blue-700', rose: 'bg-rose-50 text-rose-700', amber: 'bg-amber-50 text-amber-700' }; return <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">{title}</p><div className={`flex size-10 items-center justify-center rounded-md ${colors[tone]}`}><Icon size={20} /></div></div><p className="mt-4 text-2xl font-semibold tracking-normal">{value}</p></div>; }
function Row({ title, meta, value, tone = 'text-slate-900' }) { return <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50"><div className="min-w-0"><p className="truncate font-semibold">{title}</p><p className="truncate text-sm text-slate-500">{meta}</p></div><p className={`shrink-0 font-semibold ${tone}`}>{value}</p></div>; }
function Input({ label, value, onChange, type = 'text' }) { return <label className="block text-sm font-semibold text-slate-700">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 outline-none transition focus:border-[#2fbf71] focus:bg-white focus:ring-4 focus:ring-emerald-100" /></label>; }
function Select({ label, value, onChange, options }) { return <label className="block text-sm font-semibold text-slate-700">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 outline-none transition focus:border-[#2fbf71] focus:bg-white focus:ring-4 focus:ring-emerald-100">{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>; }

function buildMonthlyData(transactions) {
    const map = new Map();
    transactions.forEach((item) => {
        const name = item.transaction_date?.slice(5, 10) || 'Today';
        const current = map.get(name) || { name, income: 0, expense: 0 };
        current[item.type] += Number(item.base_amount || 0);
        map.set(name, current);
    });
    return Array.from(map.values()).slice(0, 10).reverse();
}

function viewTitle(view) { return { dashboard: 'Dashboard', transactions: 'Transactions', accounts: 'Accounts', categories: 'Categories' }[view] || 'Dashboard'; }
function shortDate(value) { return value ? value.slice(0, 10) : today; }
function readError(error) { const data = error.response?.data; if (data?.errors) return Object.values(data.errors).flat()[0]; if (data?.message) return data.message; return 'Something went wrong. Please try again.'; }

createRoot(document.getElementById('root')).render(<App />);
