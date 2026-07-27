import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownLeft, ArrowUpRight, Banknote, Folder, LayoutDashboard, LogOut, Plus, ReceiptText, RefreshCw, Search, WalletCards } from 'lucide-react';
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
        <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
            <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
                <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-600 text-white"><WalletCards size={22} /></div>
                    <div>
                        <p className="text-lg font-semibold">PocketLedger</p>
                        <p className="text-xs text-slate-500">Personal finance</p>
                    </div>
                </div>
                <nav className="space-y-1 p-4">
                    <NavButton icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                    <NavButton icon={ReceiptText} label="Transactions" active={activeView === 'transactions'} onClick={() => setActiveView('transactions')} />
                    <NavButton icon={WalletCards} label="Accounts" active={activeView === 'accounts'} onClick={() => setActiveView('accounts')} />
                    <NavButton icon={Folder} label="Categories" active={activeView === 'categories'} onClick={() => setActiveView('categories')} />
                </nav>
            </aside>

            <main className="lg:pl-64">
                <header className="sticky top-0 z-10 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
                    <div>
                        <p className="text-sm text-slate-500">Welcome back</p>
                        <h1 className="text-xl font-semibold">{user?.name || 'Your dashboard'}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={loadAll} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"><RefreshCw size={16} />Refresh</button>
                        <button onClick={() => logout()} className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"><LogOut size={16} />Logout</button>
                    </div>
                </header>

                <div className="block border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
                    <div className="grid grid-cols-4 gap-2">
                        <MiniNav icon={LayoutDashboard} active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                        <MiniNav icon={ReceiptText} active={activeView === 'transactions'} onClick={() => setActiveView('transactions')} />
                        <MiniNav icon={WalletCards} active={activeView === 'accounts'} onClick={() => setActiveView('accounts')} />
                        <MiniNav icon={Folder} active={activeView === 'categories'} onClick={() => setActiveView('categories')} />
                    </div>
                </div>

                <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
                    {notice && <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{notice}</div>}
                    {loading && <div className="mb-4 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">Loading latest finance data...</div>}
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
        <main className="min-h-screen bg-[#f6f7fb] px-4 py-8 text-slate-900">
            <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                <section>
                    <div className="mb-8 inline-flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-600 text-white"><WalletCards size={26} /></div>
                        <div>
                            <h1 className="text-3xl font-semibold tracking-normal">PocketLedger</h1>
                            <p className="text-slate-500">Track daily money with clarity.</p>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <ValueCard icon={Banknote} title="Daily flow" text="Income and expenses in one fast timeline." />
                        <ValueCard icon={WalletCards} title="Accounts" text="Cash, bank, savings, and wallet balances." />
                        <ValueCard icon={LayoutDashboard} title="Reports" text="Monthly summaries that reveal habits." />
                    </div>
                </section>
                <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex rounded-md bg-slate-100 p-1">
                        <button type="button" onClick={() => setMode('login')} className={`flex-1 rounded px-3 py-2 text-sm font-medium ${mode === 'login' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Login</button>
                        <button type="button" onClick={() => setMode('register')} className={`flex-1 rounded px-3 py-2 text-sm font-medium ${mode === 'register' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Register</button>
                    </div>
                    <div className="space-y-4">
                        {mode === 'register' && <Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />}
                        <Input label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
                        <Input label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
                        {mode === 'register' && <Select label="Base currency" value={form.base_currency} onChange={(base_currency) => setForm({ ...form, base_currency })} options={[['USD', 'USD'], ['KHR', 'KHR']]} />}
                    </div>
                    {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                    <button disabled={submitting} className="mt-6 w-full rounded-md bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}</button>
                </form>
            </div>
        </main>
    );
}

function Dashboard({ summary, transactions, categories, accounts, onCreated }) {
    const monthlyData = useMemo(() => buildMonthlyData(transactions), [transactions]);
    const categoryData = summary?.spending_by_category?.map((item) => ({ name: item.category?.name || 'Other', total: Number(item.total || 0), color: item.category?.color || '#64748b' })) || [];
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Metric title="Current balance" value={money(summary?.current_balance)} icon={WalletCards} tone="emerald" />
                <Metric title="Today income" value={money(summary?.today_income)} icon={ArrowUpRight} tone="blue" />
                <Metric title="Today expense" value={money(summary?.today_expense)} icon={ArrowDownLeft} tone="rose" />
                <Metric title="Monthly savings" value={money(summary?.monthly_savings)} icon={Banknote} tone="amber" />
            </div>
            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                <Panel title="Quick transaction">
                    <TransactionForm accounts={accounts} categories={categories} onCreated={onCreated} />
                </Panel>
                <Panel title="Account balances">
                    <div className="space-y-3">
                        {accounts.length === 0 && <Empty text="Create your first wallet or bank account." />}
                        {accounts.map((account) => <Row key={account.id} title={account.name} meta={`${account.type} � ${account.currency}`} value={money(account.current_balance)} />)}
                    </div>
                </Panel>
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
                <Panel title="Income vs expense">
                    <ChartBox>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => money(value)} />
                                <Bar dataKey="income" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" fill="#e11d48" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartBox>
                </Panel>
                <Panel title="Spending by category">
                    <ChartBox>
                        {categoryData.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} dataKey="total" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                                        {categoryData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(value) => money(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <Empty text="Add expenses to see category insights." />}
                    </ChartBox>
                </Panel>
            </div>
        </div>
    );
}

function Transactions({ transactions, accounts, categories, onCreated }) {
    const [search, setSearch] = useState('');
    const filtered = transactions.filter((item) => (item.description || '').toLowerCase().includes(search.toLowerCase()) || item.category?.name?.toLowerCase().includes(search.toLowerCase()));
    return (
        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
            <Panel title="Add transaction"><TransactionForm accounts={accounts} categories={categories} onCreated={onCreated} /></Panel>
            <Panel title="Transaction history">
                <div className="mb-4 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
                    <Search size={18} className="text-slate-400" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions" className="w-full outline-none" />
                </div>
                <div className="space-y-3">
                    {filtered.length === 0 && <Empty text="No transactions yet." />}
                    {filtered.map((item) => <Row key={item.id} title={item.description || item.category?.name || 'Transaction'} meta={`${item.transaction_date?.slice(0, 10)} � ${item.account?.name || 'Account'} � ${item.category?.name || 'Category'}`} value={`${item.type === 'income' ? '+' : '-'}${money(item.base_amount)}`} tone={item.type === 'income' ? 'text-emerald-700' : 'text-rose-700'} />)}
                </div>
            </Panel>
        </div>
    );
}

function Accounts({ accounts, onCreated }) {
    const [form, setForm] = useState({ name: '', type: 'cash', currency: 'USD', starting_balance: 0 });
    return <CrudPanel title="New account" form={form} setForm={setForm} onSubmit={async () => { await api.post('/accounts', form); setForm({ name: '', type: 'cash', currency: 'USD', starting_balance: 0 }); onCreated(); }} fields={<><Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} /><Select label="Type" value={form.type} onChange={(type) => setForm({ ...form, type })} options={[['cash','Cash'], ['bank','Bank'], ['wallet','Wallet'], ['savings','Savings']]} /><Select label="Currency" value={form.currency} onChange={(currency) => setForm({ ...form, currency })} options={[['USD','USD'], ['KHR','KHR']]} /><Input label="Starting balance" type="number" value={form.starting_balance} onChange={(starting_balance) => setForm({ ...form, starting_balance })} /></>} listTitle="Accounts" items={accounts.map((account) => ({ id: account.id, title: account.name, meta: `${account.type} � ${account.currency}`, value: money(account.current_balance) }))} />;
}

function Categories({ categories, onCreated }) {
    const [form, setForm] = useState({ name: '', type: 'expense', color: '#2563eb' });
    return <CrudPanel title="New category" form={form} setForm={setForm} onSubmit={async () => { await api.post('/categories', form); setForm({ name: '', type: 'expense', color: '#2563eb' }); onCreated(); }} fields={<><Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} /><Select label="Type" value={form.type} onChange={(type) => setForm({ ...form, type })} options={[['expense','Expense'], ['income','Income']]} /><Input label="Color" type="color" value={form.color} onChange={(color) => setForm({ ...form, color })} /></>} listTitle="Categories" items={categories.map((category) => ({ id: category.id, title: category.name, meta: category.type, value: category.color }))} />;
}

function TransactionForm({ accounts, categories, onCreated }) {
    const [form, setForm] = useState({ type: 'expense', account_id: '', category_id: '', amount: '', currency: 'USD', exchange_rate: 1, transaction_date: today, payment_method: '', description: '' });
    const [error, setError] = useState('');
    const availableCategories = categories.filter((category) => category.type === form.type);

    useEffect(() => {
        if (!form.account_id && accounts[0]) setForm((current) => ({ ...current, account_id: accounts[0].id }));
    }, [accounts]);

    useEffect(() => {
        const first = availableCategories[0];
        if (first && !availableCategories.some((category) => String(category.id) === String(form.category_id))) setForm((current) => ({ ...current, category_id: first.id }));
    }, [form.type, categories]);

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
                <Select label="Type" value={form.type} onChange={(type) => setForm({ ...form, type, category_id: '' })} options={[['expense','Expense'], ['income','Income']]} />
                <Input label="Amount" type="number" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
                <Select label="Account" value={form.account_id} onChange={(account_id) => setForm({ ...form, account_id })} options={accounts.map((account) => [account.id, account.name])} />
                <Select label="Category" value={form.category_id} onChange={(category_id) => setForm({ ...form, category_id })} options={availableCategories.map((category) => [category.id, category.name])} />
                <Input label="Date" type="date" value={form.transaction_date} onChange={(transaction_date) => setForm({ ...form, transaction_date })} />
                <Input label="Payment method" value={form.payment_method} onChange={(payment_method) => setForm({ ...form, payment_method })} />
            </div>
            <label className="block text-sm font-medium text-slate-700">Note<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 min-h-20 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500" /></label>
            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button disabled={accounts.length === 0} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"><Plus size={18} />Save transaction</button>
        </form>
    );
}

function CrudPanel({ title, fields, onSubmit, listTitle, items }) {
    const [error, setError] = useState('');
    async function submit(event) {
        event.preventDefault();
        setError('');
        try { await onSubmit(); } catch (err) { setError(readError(err)); }
    }
    return (
        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
            <Panel title={title}><form onSubmit={submit} className="space-y-4">{fields}{error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<button className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"><Plus size={18} />Create</button></form></Panel>
            <Panel title={listTitle}><div className="space-y-3">{items.length === 0 && <Empty text="Nothing here yet." />}{items.map((item) => <Row key={item.id} title={item.title} meta={item.meta} value={item.value} />)}</div></Panel>
        </div>
    );
}

function Panel({ title, children }) { return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-base font-semibold">{title}</h2>{children}</section>; }
function ChartBox({ children }) { return <div className="h-72 min-h-72 w-full">{children}</div>; }
function Empty({ text }) { return <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{text}</div>; }
function NavButton({ icon: Icon, label, active, onClick }) { return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium ${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}><Icon size={18} />{label}</button>; }
function MiniNav({ icon: Icon, active, onClick }) { return <button onClick={onClick} className={`flex h-10 items-center justify-center rounded-md ${active ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}><Icon size={18} /></button>; }
function ValueCard({ icon: Icon, title, text }) { return <div className="rounded-lg border border-slate-200 bg-white p-4"><Icon className="mb-3 text-emerald-600" size={24} /><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-slate-500">{text}</p></div>; }
function Metric({ title, value, icon: Icon, tone }) { const colors = { emerald: 'bg-emerald-50 text-emerald-700', blue: 'bg-blue-50 text-blue-700', rose: 'bg-rose-50 text-rose-700', amber: 'bg-amber-50 text-amber-700' }; return <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{title}</p><div className={`flex size-10 items-center justify-center rounded-md ${colors[tone]}`}><Icon size={20} /></div></div><p className="mt-4 text-2xl font-semibold">{value}</p></div>; }
function Row({ title, meta, value, tone = 'text-slate-900' }) { return <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 px-4 py-3"><div className="min-w-0"><p className="truncate font-medium">{title}</p><p className="truncate text-sm text-slate-500">{meta}</p></div><p className={`shrink-0 font-semibold ${tone}`}>{value}</p></div>; }
function Input({ label, value, onChange, type = 'text' }) { return <label className="block text-sm font-medium text-slate-700">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-emerald-500" /></label>; }
function Select({ label, value, onChange, options }) { return <label className="block text-sm font-medium text-slate-700">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 outline-none focus:border-emerald-500">{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>; }

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

function readError(error) {
    const data = error.response?.data;
    if (data?.errors) return Object.values(data.errors).flat()[0];
    if (data?.message) return data.message;
    return 'Something went wrong. Please try again.';
}

createRoot(document.getElementById('root')).render(<App />);
