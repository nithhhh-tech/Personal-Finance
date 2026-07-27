import { useEffect, useState } from 'react';
import AuthScreen from './components/AuthScreen.jsx';
import AppLayout from './components/AppLayout.jsx';
import { api } from './lib/api.js';
import { readError } from './lib/format.js';
import Accounts from './pages/Accounts.jsx';
import Categories from './pages/Categories.jsx';
import Dashboard from './pages/Dashboard.jsx';
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
    if (!user) return <LoadingSession loading={loading} notice={notice} onLogout={() => logout(false)} />;

    return (
        <AppLayout
            activeView={activeView}
            loading={loading}
            notice={notice}
            onRefresh={loadAll}
            onLogout={() => logout()}
            setActiveView={setActiveView}
            summary={summary}
            user={user}
        >
            {activeView === 'dashboard' && (
                <Dashboard
                    accounts={accounts}
                    categories={categories}
                    onCreated={loadAll}
                    summary={summary}
                    transactions={transactions}
                />
            )}
            {activeView === 'transactions' && (
                <Transactions
                    accounts={accounts}
                    categories={categories}
                    onCreated={loadAll}
                    transactions={transactions}
                />
            )}
            {activeView === 'accounts' && <Accounts accounts={accounts} onCreated={loadAll} />}
            {activeView === 'categories' && <Categories categories={categories} onCreated={loadAll} />}
        </AppLayout>
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
