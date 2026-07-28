import { useEffect, useState } from 'react';
import { MailCheck } from 'lucide-react';
import AuthScreen from './components/AuthScreen.jsx';
import AppLayout from './components/AppLayout.jsx';
import { api } from './lib/api.js';
import { readError } from './lib/format.js';
import Accounts from './pages/Accounts.jsx';
import Budgets from './pages/Budgets.jsx';
import Categories from './pages/Categories.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Reports from './pages/Reports.jsx';
import Transactions from './pages/Transactions.jsx';

export default function App() {
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
            const meRes = await api.get('/me');
            setUser(meRes.data);

            if (!meRes.data.email_verified_at) {
                setSummary(null);
                setAccounts([]);
                setCategories([]);
                setTransactions([]);
                return;
            }

            const [summaryRes, accountsRes, categoriesRes, transactionsRes] = await Promise.all([
                api.get('/dashboard/summary'),
                api.get('/accounts'),
                api.get('/categories'),
                api.get('/transactions'),
            ]);

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
    if (!user) return <LoadingSession loading={loading} notice={notice} onLogout={() => logout(false)} />;
    if (!user.email_verified_at) return <VerificationRequired user={user} onLogout={() => logout()} onRefresh={loadAll} />;

    return (
        <AppLayout
            accounts={accounts}
            activeView={activeView}
            baseCurrency={user.base_currency || 'USD'}
            categories={categories}
            loading={loading}
            notice={notice}
            onQuickCreated={loadAll}
            onRefresh={loadAll}
            onLogout={() => logout()}
            setActiveView={setActiveView}
            summary={summary}
            user={user}
        >
            {activeView === 'dashboard' && (
                <Dashboard
                    accounts={accounts}
                    baseCurrency={user.base_currency || 'USD'}
                    categories={categories}
                    onCreated={loadAll}
                    summary={summary}
                    transactions={transactions}
                />
            )}
            {activeView === 'transactions' && (
                <Transactions
                    accounts={accounts}
                    baseCurrency={user.base_currency || 'USD'}
                    categories={categories}
                    onCreated={loadAll}
                    transactions={transactions}
                />
            )}
            {activeView === 'accounts' && <Accounts accounts={accounts} onCreated={loadAll} />}
            {activeView === 'budgets' && <Budgets baseCurrency={user.base_currency || 'USD'} categories={categories} onChanged={loadAll} />}
            {activeView === 'reports' && <Reports baseCurrency={user.base_currency || 'USD'} />}
            {activeView === 'categories' && <Categories categories={categories} onCreated={loadAll} />}
        </AppLayout>
    );
}

function VerificationRequired({ user, onLogout, onRefresh }) {
    const [message, setMessage] = useState(new URLSearchParams(window.location.search).get('email_verified') ? 'Email verified. Refreshing your account...' : '');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (message) {
            window.history.replaceState({}, '', window.location.pathname);
            onRefresh();
        }
    }, []);

    async function resend() {
        setSending(true);
        setMessage('');

        try {
            const response = await api.post('/email/verification-notification');
            setMessage(response.data.message || 'Verification link sent.');
        } catch (error) {
            setMessage(readError(error));
        } finally {
            setSending(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#2a1a12] px-4 text-[#f8efe3]">
            <section className="w-full max-w-md rounded-lg border border-[#8f633e]/60 bg-[#3a251a]/90 p-6 text-center shadow-2xl shadow-black/30">
                <div className="mx-auto flex size-14 items-center justify-center rounded-md bg-[#d7a86e] text-[#2a1a12]">
                    <MailCheck size={28} />
                </div>
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Verify email</p>
                <h1 className="mt-2 text-3xl font-bold">Check your inbox</h1>
                <p className="mt-3 text-sm leading-6 text-[#d9c4ad]">We sent a verification link to {user.email}. Verify your email before opening your money tracker.</p>
                {message && <p className="mt-4 rounded-md border border-[#d7a86e]/45 bg-[#2a1a12]/60 px-3 py-2 text-sm text-[#f8efe3]">{message}</p>}
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    <button type="button" disabled={sending} onClick={resend} className="h-11 rounded-md bg-[#d7a86e] px-4 font-bold text-[#2a1a12] hover:bg-[#e8bb82] disabled:cursor-not-allowed disabled:opacity-60">
                        {sending ? 'Sending...' : 'Resend email'}
                    </button>
                    <button type="button" onClick={onLogout} className="h-11 rounded-md border border-[#8f633e]/60 bg-[#2a1a12]/60 px-4 font-bold text-[#d9c4ad] hover:bg-[#4a3022] hover:text-[#fff8ef]">
                        Logout
                    </button>
                </div>
            </section>
        </main>
    );
}

function LoadingSession({ loading, notice, onLogout }) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#2a1a12] px-4 text-[#f8efe3]">
            <div className="w-full max-w-md rounded-lg border border-[#8f633e]/60 bg-[#3a251a]/85 p-6 text-center shadow-2xl shadow-black/25">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">{loading ? 'Loading' : 'Session'}</p>
                <h1 className="mt-3 text-3xl font-bold">{loading ? 'Opening your tracker...' : 'Could not open your session.'}</h1>
                <p className="mt-3 text-sm leading-6 text-[#d9c4ad]">{notice || 'Checking your saved login before showing your dashboard.'}</p>
                {!loading && (
                    <button type="button" onClick={onLogout} className="mt-5 h-11 rounded-md bg-[#d7a86e] px-5 font-bold text-[#2a1a12] hover:bg-[#e8bb82]">
                        Back to welcome
                    </button>
                )}
            </div>
        </main>
    );
}
