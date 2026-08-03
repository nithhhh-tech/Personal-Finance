import { useEffect, useState } from 'react';
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
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('apple_theme') === 'dark';
    });
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('apple_language') || 'en';
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('apple_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('apple_theme', 'light');
        }
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('apple_language', language);
    }, [language]);

    function toggleTheme() {
        setDarkMode((prev) => !prev);
    }

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

    if (!token) return <AuthScreen onAuthed={saveToken} darkMode={darkMode} toggleTheme={toggleTheme} />;

    return (
        <AppLayout
            activeView={activeView}
            darkMode={darkMode}
            loading={loading}
            notice={notice}
            onLogout={() => logout()}
            onRefresh={loadAll}
            setActiveView={setActiveView}
            summary={summary}
            toggleTheme={toggleTheme}
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
            {activeView === 'budgets' && (
                <Budgets baseCurrency={user?.base_currency || 'USD'} categories={categories} onChanged={loadAll} />
            )}
            {activeView === 'reports' && <Reports baseCurrency={user?.base_currency || 'USD'} />}
        </AppLayout>
    );
}
