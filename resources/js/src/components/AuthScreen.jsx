import { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, CalendarCheck, CircleDollarSign, ExternalLink, LockKeyhole, Menu, PieChart, ReceiptText, ShieldCheck, Sparkles, TrendingDown, TrendingUp, WalletCards, X } from 'lucide-react';
import { api } from '../lib/api.js';
import { readError } from '../lib/format.js';
import { CURRENCY_OPTIONS } from '../lib/currencies.js';
import { Input, Select } from './ui.jsx';

export default function AuthScreen({ onAuthed, initialMode = 'login' }) {
    const [mode, setMode] = useState(initialMode);
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', token: '', base_currency: 'USD' });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const authIsOpen = mode === 'login' || mode === 'register' || mode === 'forgot' || mode === 'reset';

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('reset_token');
        const email = params.get('email');

        if (token) {
            setForm((current) => ({ ...current, token, email: email || current.email }));
            setMode('reset');
        }
    }, []);

    function closeAuth() {
        setError('');
        setMessage('');
        setMode('welcome');
    }

    async function submit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        setMessage('');

        try {
            const endpoint = {
                login: '/login',
                register: '/register',
                forgot: '/forgot-password',
                reset: '/reset-password',
            }[mode];
            const payload = {
                login: { email: form.email, password: form.password },
                register: form,
                forgot: { email: form.email },
                reset: { email: form.email, token: form.token, password: form.password, password_confirmation: form.password_confirmation },
            }[mode];
            const response = await api.post(endpoint, payload);
            if (mode === 'forgot') {
                setMessage(response.data.message || 'Password reset link sent.');
            } else if (mode === 'reset') {
                window.history.replaceState({}, '', window.location.pathname);
                setForm((current) => ({ ...current, password: '', password_confirmation: '', token: '' }));
                setMessage(response.data.message || 'Password reset. You can log in now.');
                setMode('login');
            } else {
                onAuthed(response.data.token);
            }
        } catch (err) {
            setError(readError(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <LandingPage setMode={setMode} />
            {authIsOpen && (
                <AuthDrawer onClose={closeAuth}>
                    <AuthForm error={error} form={form} message={message} mode={mode} setForm={setForm} setMessage={setMessage} setMode={setMode} submit={submit} submitting={submitting} onClose={closeAuth} />
                </AuthDrawer>
            )}
        </>
    );
}

function LandingPage({ setMode }) {
    const [activeTab, setActiveTab] = useState('home');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navItems = [
        ['Home', 'home'],
        ['Features', 'features'],
        ['How It Works', 'flow'],
        ['Privacy', 'privacy'],
        ['Contact', 'contact'],
    ];
    const features = [
        {
            icon: ReceiptText,
            eyebrow: 'Record',
            title: 'Write down every money move',
            text: 'Add income and expenses with the wallet, category, date, and note that keep each record useful.',
        },
        {
            icon: WalletCards,
            eyebrow: 'Organize',
            title: 'Keep wallets and categories clean',
            text: 'Separate cash, bank, savings, and daily spending so your balance does not become a guess.',
        },
        {
            icon: PieChart,
            eyebrow: 'Review',
            title: 'See what is left for the month',
            text: 'Follow income, expenses, and budget progress without opening a complicated accounting tool.',
        },
    ];
    const steps = [
        ['01', 'Record', 'Save each income or expense before you forget the details.'],
        ['02', 'Organize', 'Put each record into the right wallet and category.'],
        ['03', 'Review', 'Check monthly totals and budget pace whenever you need clarity.'],
    ];

    function scrollToSection(id) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function selectSection(id) {
        setActiveTab(id);
        setMobileMenuOpen(false);
        scrollToSection(id);
    }

    return (
        <main className="min-h-screen overflow-x-hidden scroll-smooth bg-[#160c08] pt-16 text-[#fff8ef]">
            <header className="fixed inset-x-0 top-0 z-50 border-b border-[#d7a86e]/10 bg-[#160c08]/92 shadow-lg shadow-black/20 backdrop-blur">
                <nav className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-4 sm:px-6">
                    <button type="button" onClick={() => selectSection('home')} className="flex shrink-0 items-center gap-3 text-left">
                        <span>
                            <span className="block text-lg font-black leading-5 text-[#fff8ef] sm:text-xl">
                                Pocket<span className="text-[#d7a86e]">Ledger</span>
                            </span>
                            <span className="block text-xs font-medium leading-4 text-[#d9c4ad]">Personal finance</span>
                        </span>
                    </button>
                    <div className="ml-4 hidden items-center gap-6 lg:flex">
                        {navItems.map(([label, id]) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => selectSection(id)}
                                className={`relative h-16 text-sm font-semibold transition-colors duration-300 ${activeTab === id ? 'text-[#fff8ef]' : 'text-[#d9c4ad] hover:text-[#fff8ef]'}`}
                            >
                                {label}
                                <span className={`absolute inset-x-0 bottom-0 h-[2px] origin-center rounded-full bg-[#d7a86e] transition-transform duration-300 ease-out ${activeTab === id ? 'scale-x-100' : 'scale-x-0'}`} />
                            </button>
                        ))}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            type="button"
                            aria-expanded={mobileMenuOpen}
                            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            onClick={() => setMobileMenuOpen((open) => !open)}
                            className="flex size-10 items-center justify-center rounded-md bg-[#24140e] text-[#fff8ef] transition-colors hover:bg-[#2a1810] lg:hidden"
                        >
                            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
                        </button>
                        <button type="button" onClick={() => setMode('login')} className="hidden h-10 rounded-md bg-[#24140e] px-4 text-sm font-bold text-[#fff8ef] ring-1 ring-[#d7a86e]/18 transition hover:bg-[#2a1810] hover:ring-[#d7a86e]/35 sm:block">Login</button>
                        <button type="button" onClick={() => setMode('register')} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#d7a86e] px-3 text-sm font-black text-[#2a1a12] shadow-lg shadow-black/20 transition hover:bg-[#e8bb82] sm:px-4">
                            Get Started
                            <ArrowRight size={16} className="hidden sm:block" />
                        </button>
                    </div>
                </nav>
                <div className={`overflow-hidden border-t border-[#d7a86e]/10 bg-[#160c08]/96 shadow-xl shadow-black/20 transition-all duration-300 ease-out lg:hidden ${mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="mx-auto grid max-w-7xl gap-1 px-4 py-3 sm:px-6">
                        {navItems.map(([label, id]) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => selectSection(id)}
                                className={`relative flex h-11 items-center rounded-md px-4 text-left text-sm font-semibold transition-colors ${activeTab === id ? 'bg-[#24140e] text-[#fff8ef]' : 'text-[#d9c4ad] hover:bg-[#24140e] hover:text-[#fff8ef]'}`}
                            >
                                <span className={`absolute left-0 top-2 h-7 w-[3px] rounded-full bg-[#d7a86e] transition-transform duration-300 ${activeTab === id ? 'scale-y-100' : 'scale-y-0'}`} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <section id="home" className="mx-auto grid max-w-7xl scroll-mt-24 items-center gap-10 px-4 pb-14 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:grid-cols-[0.95fr_1.05fr] lg:pt-20">
                <div>
                    <p className="inline-flex items-center gap-2 rounded-md bg-[#24140e] px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">
                        <Sparkles size={16} />
                        Personal money, simplified
                    </p>
                    <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-tight tracking-normal text-[#fff8ef] sm:text-6xl lg:text-7xl">Your money, organized.</h1>
                    <p className="mt-6 max-w-2xl text-base leading-7 text-[#f1dfc8] sm:text-lg sm:leading-8">Track income, expenses, wallets, and budgets without complicated accounting. See what came in, what went out, and what is left.</p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button type="button" onClick={() => setMode('register')} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#d7a86e] px-6 font-bold text-[#2a1a12] shadow-xl shadow-black/20 hover:bg-[#e8bb82]">
                            Start Tracking Free
                            <ArrowRight size={18} />
                        </button>
                        <button type="button" onClick={() => selectSection('features')} className="h-12 rounded-md bg-[#24140e] px-6 font-semibold text-[#fff8ef] hover:bg-[#2a1810]">View Features</button>
                    </div>
                    <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
                        <LandingMiniStat label="Income" value="+$1,840" tone="income" />
                        <LandingMiniStat label="Expense" value="-$965" tone="expense" />
                        <LandingMiniStat label="Left" value="$875" tone="gold" />
                    </div>
                </div>

                <WelcomeMoneyVisual />
            </section>

            <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
                <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Features</p>
                        <h2 className="mt-3 max-w-xl text-4xl font-bold leading-tight text-[#fff8ef] sm:text-5xl">Built for daily tracking, not accounting homework.</h2>
                    </div>
                    <p className="max-w-2xl text-sm leading-7 text-[#d9c4ad]">A welcome page should explain the habit: record what happened, organize where money lives, and review the month before spending gets blurry.</p>
                </div>

                <div className="mt-12 grid gap-4 lg:grid-cols-3">
                    {features.map((item) => {
                        const Icon = item.icon;
                        return (
                            <article key={item.title} className="rounded-lg bg-[#24140e] p-6 shadow-xl shadow-black/15">
                                <span className="flex size-12 items-center justify-center rounded-md bg-[#d7a86e] text-[#2a1a12]">
                                    <Icon size={22} />
                                </span>
                                <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-[#f2c38b]">{item.eyebrow}</p>
                                <h3 className="mt-2 text-2xl font-bold text-[#fff8ef]">{item.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-[#d9c4ad]">{item.text}</p>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section id="flow" className="scroll-mt-24 bg-[#21130d]">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">How It Works</p>
                            <h2 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-[#fff8ef] sm:text-5xl">Record. Organize. Review.</h2>
                        </div>
                        <p className="max-w-md text-sm leading-7 text-[#d9c4ad]">A simple rhythm for people who want money clarity without learning finance software.</p>
                    </div>
                    <div className="mt-12 grid gap-8 lg:grid-cols-3">
                        {steps.map(([number, title, text]) => (
                            <article key={number} className="border-t border-[#d7a86e]/22 pt-6">
                                <p className="text-5xl font-bold text-[#d7a86e]">{number}</p>
                                <h3 className="mt-5 text-2xl font-bold text-[#fff8ef]">{title}</h3>
                                <p className="mt-3 text-sm leading-7 text-[#d9c4ad]">{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="privacy" className="mx-auto grid max-w-7xl scroll-mt-24 gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.95fr_1.05fr]">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Privacy</p>
                    <h2 className="mt-3 max-w-xl text-4xl font-bold leading-tight text-[#fff8ef] sm:text-5xl">Private by default. Clear by design.</h2>
                    <p className="mt-5 max-w-lg text-sm leading-7 text-[#d9c4ad]">The welcome page only shows examples. Your real accounts, wallets, records, and reports appear only after login.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-[#24140e] p-6 shadow-xl shadow-black/15">
                        <span className="flex size-11 items-center justify-center rounded-md bg-[#d7a86e] text-[#2a1a12]">
                            <LockKeyhole size={21} />
                        </span>
                        <h3 className="mt-5 text-xl font-bold text-[#fff8ef]">Account protected</h3>
                        <p className="mt-3 text-sm leading-7 text-[#d9c4ad]">Records belong to your login and are loaded only for your session.</p>
                    </div>
                    <div className="rounded-lg bg-[#24140e] p-6 shadow-xl shadow-black/15">
                        <span className="flex size-11 items-center justify-center rounded-md bg-[#d7a86e] text-[#2a1a12]">
                            <CalendarCheck size={21} />
                        </span>
                        <h3 className="mt-5 text-xl font-bold text-[#fff8ef]">Real saved records</h3>
                        <p className="mt-3 text-sm leading-7 text-[#d9c4ad]">Reports and totals use your own transactions, not public demo data.</p>
                    </div>
                </div>
            </section>

            <section id="contact" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-20 sm:px-6 sm:pb-24">
                <div className="mb-6 rounded-lg bg-[#d7a86e] p-6 text-[#2a1a12] shadow-2xl shadow-black/20 sm:p-8">
                    <div className="grid items-center gap-5 lg:grid-cols-[1fr_auto]">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.16em]">Start today</p>
                            <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Start tracking your money with less stress.</h2>
                        </div>
                        <button type="button" onClick={() => setMode('register')} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#2a1a12] px-5 font-bold text-[#fff8ef] hover:bg-[#3a251a]">
                            Create Account
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
                <div className="grid items-center gap-8 rounded-lg bg-[#24140e] p-6 shadow-2xl shadow-black/25 sm:p-8 lg:grid-cols-[1fr_auto]">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Contact</p>
                        <h2 className="mt-3 text-3xl font-bold leading-tight text-[#fff8ef] sm:text-4xl">Need help or want to suggest something?</h2>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d9c4ad]">Facebook is the only contact option for support, feedback, and product questions.</p>
                    </div>
                    <a href="https://web.facebook.com/its.nithhhh" target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-3 rounded-md bg-[#d7a86e] px-5 font-bold text-[#2a1a12] hover:bg-[#e8bb82]">
                        Facebook
                        <ExternalLink size={18} />
                    </a>
                </div>
            </section>
        </main>
    );
}

function WelcomeMoneyVisual() {
    return (
        <div className="relative mx-auto w-full max-w-xl">
            <div className="rounded-lg bg-[#24140e] p-5 shadow-2xl shadow-black/35">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Month Snapshot</p>
                        <h2 className="mt-2 text-3xl font-bold text-[#fff8ef]">$875 left</h2>
                    </div>
                    <span className="flex size-12 items-center justify-center rounded-md bg-[#d7a86e] text-[#2a1a12]">
                        <CircleDollarSign size={24} />
                    </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <FinanceTile icon={TrendingUp} label="Income" value="+$1,840" tone="income" />
                    <FinanceTile icon={TrendingDown} label="Expenses" value="-$965" tone="expense" />
                </div>

                <div className="mt-3 rounded-lg bg-[#180d09] p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-[#fff8ef]">Monthly budget</span>
                        <span className="font-bold text-[#f2c38b]">64% used</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-[#3a251a]">
                        <div className="h-2 w-[64%] rounded-full bg-[#d7a86e]" />
                    </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <WalletChip label="Cash" value="$325" />
                    <WalletChip label="Bank" value="$1,120" />
                    <WalletChip label="Savings" value="$2,800" />
                </div>

                <div className="mt-5 space-y-2">
                    <MoneyLine label="Salary" value="+$1,500" tone="income" />
                    <MoneyLine label="Food and coffee" value="-$84" tone="expense" />
                    <MoneyLine label="Transport" value="-$18" tone="expense" />
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[#2a1810] p-4">
                    <p className="text-sm font-semibold text-[#d9c4ad]">Daily habit</p>
                    <p className="mt-2 text-xl font-bold text-[#fff8ef]">Log in seconds</p>
                </div>
                <div className="rounded-lg bg-[#d7a86e] p-4 text-[#2a1a12]">
                    <p className="text-sm font-bold">Budget pace</p>
                    <p className="mt-2 text-xl font-bold">Clear all month</p>
                </div>
            </div>
        </div>
    );
}

function LandingMiniStat({ label, value, tone }) {
    const toneClass = {
        income: 'text-emerald-200',
        expense: 'text-rose-200',
        gold: 'text-[#f2c38b]',
    }[tone];

    return (
        <div className="border-l border-[#d7a86e]/30 pl-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#d9c4ad]">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${toneClass}`}>{value}</p>
        </div>
    );
}

function FinanceTile({ icon: Icon, label, value, tone }) {
    const toneClass = {
        income: 'text-emerald-200',
        expense: 'text-rose-200',
    }[tone];

    return (
        <div className="rounded-lg bg-[#180d09] p-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#d9c4ad]">{label}</p>
                <Icon size={18} className={toneClass} />
            </div>
            <p className={`mt-3 text-2xl font-bold ${toneClass}`}>{value}</p>
        </div>
    );
}

function WalletChip({ label, value }) {
    return (
        <div className="rounded-md bg-[#180d09]/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#d9c4ad]">{label}</p>
            <p className="mt-1 font-bold text-[#fff8ef]">{value}</p>
        </div>
    );
}

function MoneyLine({ label, value, tone }) {
    const toneClass = tone === 'income' ? 'text-emerald-200' : 'text-rose-200';

    return (
        <div className="flex items-center justify-between rounded-md bg-[#180d09]/80 px-3 py-2 text-sm">
            <span className="text-[#fff8ef]">{label}</span>
            <span className={`font-bold ${toneClass}`}>{value}</span>
        </div>
    );
}

function LegacyLandingPage({ setMode }) {
    const navItems = [
        ['Home', 'home'],
        ['Features', 'features'],
        ['How It Works', 'flow'],
        ['Security', 'privacy'],
        ['Support', 'contact'],
    ];
    const highlights = [
        {
            icon: ReceiptText,
            eyebrow: 'Daily control',
            title: 'Record money before details fade',
            text: 'Capture income and expenses with the wallet, category, date, and note that make each record useful later.',
        },
        {
            icon: PieChart,
            eyebrow: 'Budget clarity',
            title: 'See how much month is left',
            text: 'Compare spending against monthly budgets and spot the categories that are moving too quickly.',
        },
        {
            icon: WalletCards,
            eyebrow: 'Wallet view',
            title: 'Know where the balance lives',
            text: 'Separate cash, bank, savings, and digital wallets so your total money does not become a guess.',
        },
    ];
    const steps = [
        ['01', 'Create your wallets', 'Add cash, bank, savings, or any place where you keep money.'],
        ['02', 'Log each movement', 'Choose income or expense, then save the amount, category, date, and note.'],
        ['03', 'Check the month', 'Review balance, spending pace, budget progress, and recent transactions.'],
    ];

    function scrollToSection(id) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return (
        <main className="min-h-screen overflow-x-hidden scroll-smooth bg-[#160c08] pt-16 text-[#fff8ef]">
            <header className="fixed inset-x-0 top-0 z-50 border-b border-[#d7a86e]/10 bg-[#160c08]/92 shadow-lg shadow-black/20 backdrop-blur">
                <nav className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-4 sm:px-6">
                    <button type="button" onClick={() => scrollToSection('home')} className="flex shrink-0 items-center gap-3 text-left">
                        <span className="flex size-9 items-center justify-center rounded-md bg-[#d7a86e] text-[#2a1a12]">
                            <WalletCards size={20} />
                        </span>
                        <span>
                            <span className="block text-sm font-bold leading-4 text-[#fff8ef] sm:text-base">PocketLedger</span>
                            <span className="block text-xs font-medium text-[#d9c4ad]">Personal finance</span>
                        </span>
                    </button>
                    <div className="ml-4 hidden items-center gap-6 lg:flex">
                        {navItems.map(([label, id]) => (
                            <button key={id} type="button" onClick={() => scrollToSection(id)} className="text-sm font-semibold text-[#d9c4ad] hover:text-[#fff8ef]">
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <button type="button" onClick={() => setMode('login')} className="hidden h-10 rounded-md px-4 text-sm font-semibold text-[#fff8ef] hover:bg-[#2a1810] sm:block">Login</button>
                        <button type="button" onClick={() => setMode('register')} className="h-10 rounded-md bg-[#d7a86e] px-4 text-sm font-bold text-[#2a1a12] shadow-lg shadow-black/20 hover:bg-[#e8bb82]">Get Started</button>
                    </div>
                </nav>
            </header>

            <section id="home" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:pt-20">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="inline-flex items-center gap-2 rounded-md bg-[#24140e] px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">
                        <Sparkles size={16} />
                        Warm fintech for daily money
                    </p>
                    <h1 className="mt-6 text-5xl font-bold leading-tight tracking-normal text-[#fff8ef] sm:text-6xl lg:text-7xl">Know where your money goes.</h1>
                    <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#f1dfc8] sm:text-lg sm:leading-8">Track income, expenses, wallets, and monthly budgets in one private dashboard that makes your daily spending easier to understand.</p>
                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <button type="button" onClick={() => setMode('register')} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#d7a86e] px-6 font-bold text-[#2a1a12] shadow-xl shadow-black/20 hover:bg-[#e8bb82]">
                            Start Tracking Free
                            <ArrowRight size={18} />
                        </button>
                        <button type="button" onClick={() => scrollToSection('features')} className="h-12 rounded-md bg-[#24140e] px-6 font-semibold text-[#fff8ef] hover:bg-[#2a1810]">View Features</button>
                    </div>
                </div>

                <div className="mt-12">
                    <DashboardPreview />
                </div>

                <div className="mx-auto mt-10 grid max-w-5xl gap-6 border-y border-[#d7a86e]/12 py-6 sm:grid-cols-3">
                    <div>
                        <p className="text-3xl font-bold text-[#fff8ef]">Daily</p>
                        <p className="mt-1 text-sm leading-6 text-[#d9c4ad]">Fast records for income and expenses.</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-[#fff8ef]">Wallets</p>
                        <p className="mt-1 text-sm leading-6 text-[#d9c4ad]">Cash, bank, savings, and digital balances.</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-[#fff8ef]">Budgets</p>
                        <p className="mt-1 text-sm leading-6 text-[#d9c4ad]">Monthly limits that stay visible.</p>
                    </div>
                </div>
            </section>

            <section id="features" className="mx-auto grid max-w-7xl scroll-mt-24 gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.85fr_1.25fr]">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Features</p>
                    <h2 className="mt-3 max-w-xl text-4xl font-bold leading-tight text-[#fff8ef] sm:text-5xl">Less guessing. More control.</h2>
                    <p className="mt-5 max-w-lg text-sm leading-7 text-[#d9c4ad]">The welcome page now puts the product first: clear money movement, wallet balances, and monthly budget visibility.</p>
                </div>
                <div className="divide-y divide-[#d7a86e]/12">
                    {highlights.map((item) => {
                        const Icon = item.icon;
                        return (
                            <article key={item.title} className="grid gap-5 py-7 sm:grid-cols-[52px_1fr] sm:py-8">
                                <span className="flex size-12 items-center justify-center rounded-md bg-[#d7a86e] text-[#2a1a12]">
                                    <Icon size={22} />
                                </span>
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#f2c38b]">{item.eyebrow}</p>
                                    <h3 className="mt-2 text-2xl font-bold text-[#fff8ef]">{item.title}</h3>
                                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d9c4ad]">{item.text}</p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section id="flow" className="scroll-mt-24 bg-[#21130d]">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">How It Works</p>
                            <h2 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-[#fff8ef] sm:text-5xl">A three-step rhythm for your money.</h2>
                        </div>
                        <p className="max-w-md text-sm leading-7 text-[#d9c4ad]">No accounting maze. Set up the basics, record what happens, and review the month when you need clarity.</p>
                    </div>
                    <div className="mt-12 grid gap-8 lg:grid-cols-3">
                        {steps.map(([number, title, text]) => (
                            <article key={number} className="border-t border-[#d7a86e]/22 pt-6">
                                <p className="text-5xl font-bold text-[#d7a86e]">{number}</p>
                                <h3 className="mt-5 text-2xl font-bold text-[#fff8ef]">{title}</h3>
                                <p className="mt-3 text-sm leading-7 text-[#d9c4ad]">{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="privacy" className="mx-auto grid max-w-7xl scroll-mt-24 gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.95fr_1.05fr]">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Security</p>
                    <h2 className="mt-3 max-w-xl text-4xl font-bold leading-tight text-[#fff8ef] sm:text-5xl">Private by default. Clear by design.</h2>
                    <p className="mt-5 max-w-lg text-sm leading-7 text-[#d9c4ad]">The dashboard preview is only an example. Your real accounts, wallets, records, and reports appear only after login.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-[#24140e] p-6 shadow-xl shadow-black/15">
                        <span className="flex size-11 items-center justify-center rounded-md bg-[#d7a86e] text-[#2a1a12]">
                            <LockKeyhole size={21} />
                        </span>
                        <h3 className="mt-5 text-xl font-bold text-[#fff8ef]">Account protected</h3>
                        <p className="mt-3 text-sm leading-7 text-[#d9c4ad]">Records belong to your login and are loaded only for your session.</p>
                    </div>
                    <div className="rounded-lg bg-[#24140e] p-6 shadow-xl shadow-black/15">
                        <span className="flex size-11 items-center justify-center rounded-md bg-[#d7a86e] text-[#2a1a12]">
                            <CalendarCheck size={21} />
                        </span>
                        <h3 className="mt-5 text-xl font-bold text-[#fff8ef]">Real saved records</h3>
                        <p className="mt-3 text-sm leading-7 text-[#d9c4ad]">Reports and totals use your own transactions, not public demo data.</p>
                    </div>
                </div>
            </section>

            <section id="contact" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-20 sm:px-6 sm:pb-24">
                <div className="grid items-center gap-8 rounded-lg bg-[#24140e] p-6 shadow-2xl shadow-black/25 sm:p-8 lg:grid-cols-[1fr_auto]">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Support</p>
                        <h2 className="mt-3 text-3xl font-bold leading-tight text-[#fff8ef] sm:text-4xl">Need help or want to suggest something?</h2>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d9c4ad]">Facebook is the only contact option for support, feedback, and product questions.</p>
                    </div>
                    <a href="https://web.facebook.com/its.nithhhh" target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-3 rounded-md bg-[#d7a86e] px-5 font-bold text-[#2a1a12] hover:bg-[#e8bb82]">
                        Facebook
                        <ExternalLink size={18} />
                    </a>
                </div>
            </section>
        </main>
    );
}

function DashboardPreview() {
    const bars = [46, 62, 38, 76, 54, 69, 48, 82, 58, 66];
    const budgets = [
        ['Food', '$420', 72, 'bg-[#d7a86e]'],
        ['Transport', '$120', 44, 'bg-emerald-300'],
        ['Shopping', '$260', 81, 'bg-rose-300'],
    ];

    return (
        <div className="mx-auto max-w-6xl overflow-hidden rounded-lg bg-[#24140e] shadow-2xl shadow-black/35">
            <div className="flex h-12 items-center justify-between bg-[#2a1810] px-4">
                <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-rose-300" />
                    <span className="size-2 rounded-full bg-[#d7a86e]" />
                    <span className="size-2 rounded-full bg-emerald-300" />
                </div>
                <p className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-[#f2c38b] sm:block">Dashboard Preview</p>
                <p className="text-sm font-semibold text-[#d9c4ad]">August</p>
            </div>

            <div className="grid lg:grid-cols-[230px_1fr]">
                <aside className="hidden bg-[#180d09] p-5 lg:block">
                    <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-md bg-[#d7a86e] text-[#2a1a12]">
                            <WalletCards size={19} />
                        </span>
                        <div>
                            <p className="font-bold text-[#fff8ef]">PocketLedger</p>
                            <p className="text-xs text-[#d9c4ad]">Personal workspace</p>
                        </div>
                    </div>
                    <div className="mt-8 space-y-2 text-sm">
                        {['Overview', 'Transactions', 'Wallets', 'Budgets'].map((item, index) => (
                            <div key={item} className={`rounded-md px-3 py-2 font-semibold ${index === 0 ? 'bg-[#d7a86e] text-[#2a1a12]' : 'text-[#d9c4ad]'}`}>
                                {item}
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 rounded-lg bg-[#24140e] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f2c38b]">Wallets</p>
                        <div className="mt-4 space-y-3">
                            <WalletLine name="Cash" value="$325" />
                            <WalletLine name="Bank" value="$1,120" />
                            <WalletLine name="Savings" value="$2,800" />
                        </div>
                    </div>
                </aside>

                <div className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm text-[#d9c4ad]">Money left this month</p>
                            <p className="mt-1 text-4xl font-bold text-[#fff8ef] sm:text-5xl">$875.00</p>
                        </div>
                        <div className="rounded-md bg-[#180d09] px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f2c38b]">Budget used</p>
                            <p className="mt-1 text-2xl font-bold text-[#fff8ef]">64%</p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <PreviewMetric icon={TrendingUp} label="Income" value="$1,840" tone="income" />
                        <PreviewMetric icon={TrendingDown} label="Expense" value="$965" tone="expense" />
                        <PreviewMetric icon={CircleDollarSign} label="Net" value="$875" tone="gold" />
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.8fr]">
                        <div className="rounded-lg bg-[#180d09] p-4">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-bold text-[#fff8ef]">Cash flow</p>
                                    <p className="text-sm text-[#d9c4ad]">Last 10 days</p>
                                </div>
                                <BarChart3 size={20} className="text-[#f2c38b]" />
                            </div>
                            <div className="flex h-44 items-end gap-2">
                                {bars.map((height, index) => (
                                    <div key={index} className="flex flex-1 items-end rounded-sm bg-[#3a251a]">
                                        <div
                                            className={`w-full rounded-sm ${index === 2 || index === 7 ? 'bg-rose-300' : 'bg-[#d7a86e]'}`}
                                            style={{ height: `${height}%` }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg bg-[#180d09] p-4">
                            <p className="font-bold text-[#fff8ef]">Monthly budgets</p>
                            <div className="mt-5 space-y-5">
                                {budgets.map(([label, value, progress, color]) => (
                                    <div key={label}>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-[#d9c4ad]">{label}</span>
                                            <span className="font-bold text-[#fff8ef]">{value}</span>
                                        </div>
                                        <div className="mt-2 h-2 rounded-full bg-[#3a251a]">
                                            <div className={`h-2 rounded-full ${color}`} style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <PreviewRow icon={CircleDollarSign} label="Salary" amount="+$1,500" tone="income" />
                        <PreviewRow icon={ReceiptText} label="Food" amount="-$84" tone="expense" />
                        <PreviewRow icon={WalletCards} label="Cash wallet" amount="$325" tone="gold" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function PreviewMetric({ icon: Icon, label, value, tone }) {
    const toneClass = {
        income: 'text-emerald-200',
        expense: 'text-rose-200',
        gold: 'text-[#f2c38b]',
    }[tone];

    return (
        <div className="rounded-lg bg-[#180d09] p-4">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#d9c4ad]">{label}</p>
                <Icon size={18} className={toneClass} />
            </div>
            <p className="mt-3 text-2xl font-bold text-[#fff8ef]">{value}</p>
        </div>
    );
}

function WalletLine({ name, value }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-[#d9c4ad]">{name}</span>
            <span className="font-bold text-[#fff8ef]">{value}</span>
        </div>
    );
}

function PreviewRow({ icon: Icon, label, amount, tone }) {
    const toneClass = {
        income: 'text-emerald-200',
        expense: 'text-rose-200',
        gold: 'text-[#f2c38b]',
    }[tone];

    return (
        <div className="flex min-h-14 items-center justify-between gap-3 rounded-md bg-[#180d09]/85 px-3 py-3 text-sm">
            <span className="flex items-center gap-2 text-[#fff8ef]">
                <Icon size={16} className={toneClass} />
                {label}
            </span>
            <span className={`font-bold ${toneClass}`}>{amount}</span>
        </div>
    );
}

function AuthDrawer({ children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#120b07]/70 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
            <button type="button" aria-label="Close auth drawer" onClick={onClose} className="absolute inset-0 cursor-default" />
            <div className="auth-drawer-panel relative z-10 w-full max-w-4xl">
                {children}
            </div>
        </div>
    );
}

function AuthForm({ error, form, message, mode, setForm, setMessage, setMode, submit, submitting, onClose }) {
    const titles = {
        login: ['Login', 'Welcome back', 'Open your private money tracker.'],
        register: ['Create account', 'Start tracking today', 'Create your private workspace and set your base currency.'],
        forgot: ['Password reset', 'Reset your password', 'Enter your email and we will send a reset link.'],
        reset: ['New password', 'Choose a new password', 'Set a fresh password for your account.'],
    };
    const [eyebrow, title, text] = titles[mode];
    const showTabs = mode === 'login' || mode === 'register';

    return (
        <form onSubmit={submit} className="grid max-h-[calc(100vh-1rem)] w-full overflow-y-auto rounded-t-lg bg-[#160c08] text-[#fff8ef] shadow-2xl shadow-black/40 ring-1 ring-[#d7a86e]/18 sm:max-h-[calc(100vh-3rem)] sm:rounded-lg lg:grid-cols-[0.9fr_1fr]">
            <aside className="hidden bg-[#d7a86e] p-8 text-[#2a1a12] lg:flex lg:flex-col lg:justify-between">
                <div>
                    <p className="text-sm font-black uppercase tracking-[0.16em]">PocketLedger</p>
                    <h2 className="mt-4 text-4xl font-black leading-tight">Your money, organized.</h2>
                    <p className="mt-4 text-sm font-semibold leading-7 text-[#3a251a]">Track income, expenses, wallets, and budgets from one private account.</p>
                </div>
                <div className="mt-8 grid gap-3">
                    <AuthBenefit icon={ReceiptText} title="Daily records" text="Save income and expenses before details fade." />
                    <AuthBenefit icon={WalletCards} title="Wallet clarity" text="Separate cash, bank, and savings balances." />
                    <AuthBenefit icon={PieChart} title="Monthly focus" text="Check what is left against your budget." />
                </div>
            </aside>

            <div className="bg-[#d7a86e] p-5 text-[#2a1a12] lg:hidden">
                <p className="text-xs font-black uppercase tracking-[0.16em]">PocketLedger</p>
                <h2 className="mt-2 text-2xl font-black leading-tight">Your money, organized.</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#3a251a]">Track income, expenses, wallets, and budgets from one private account.</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-black">
                    <span className="rounded-md bg-[#2a1a12]/12 px-2 py-2">Records</span>
                    <span className="rounded-md bg-[#2a1a12]/12 px-2 py-2">Wallets</span>
                    <span className="rounded-md bg-[#2a1a12]/12 px-2 py-2">Budgets</span>
                </div>
            </div>

            <div className="p-5 sm:p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <button type="button" onClick={onClose} className="text-sm font-bold text-[#d9c4ad] transition hover:text-[#fff8ef]">Back to welcome</button>
                    <button type="button" aria-label="Close auth drawer" onClick={onClose} className="flex size-10 items-center justify-center rounded-md bg-[#24140e] text-[#d9c4ad] transition hover:bg-[#2a1810] hover:text-[#fff8ef]">
                        <X size={18} />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">{eyebrow}</p>
                    <h2 className="mt-2 text-3xl font-black tracking-normal text-[#fff8ef]">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">{text}</p>
                </div>

                {showTabs && (
                    <div className="mb-6 grid grid-cols-2 rounded-md bg-[#24140e] p-1">
                        <button type="button" onClick={() => { setMessage(''); setMode('login'); }} className={`h-10 rounded-md text-sm font-black transition ${mode === 'login' ? 'bg-[#d7a86e] text-[#2a1a12] shadow-sm' : 'text-[#d9c4ad] hover:bg-[#2a1810] hover:text-[#fff8ef]'}`}>Login</button>
                        <button type="button" onClick={() => { setMessage(''); setMode('register'); }} className={`h-10 rounded-md text-sm font-black transition ${mode === 'register' ? 'bg-[#d7a86e] text-[#2a1a12] shadow-sm' : 'text-[#d9c4ad] hover:bg-[#2a1810] hover:text-[#fff8ef]'}`}>Register</button>
                    </div>
                )}

                <div className="space-y-4">
                    {mode === 'register' && <Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} variant="dark" />}
                    <Input label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} variant="dark" />
                    {mode !== 'forgot' && <Input label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} variant="dark" />}
                    {mode === 'reset' && <Input label="Confirm password" type="password" value={form.password_confirmation} onChange={(password_confirmation) => setForm({ ...form, password_confirmation })} variant="dark" />}
                    {mode === 'register' && <Select label="Base currency" value={form.base_currency} onChange={(base_currency) => setForm({ ...form, base_currency })} options={CURRENCY_OPTIONS} variant="dark" />}
                </div>

                {error && <p className="mt-4 rounded-md bg-red-950/45 px-3 py-2 text-sm text-red-100 ring-1 ring-red-300/25">{error}</p>}
                {message && <p className="mt-4 rounded-md bg-emerald-950/35 px-3 py-2 text-sm text-emerald-100 ring-1 ring-emerald-300/25">{message}</p>}

                <button disabled={submitting} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#d7a86e] px-4 font-black text-[#2a1a12] shadow-lg shadow-black/25 transition hover:bg-[#e8bb82] disabled:cursor-not-allowed disabled:opacity-60">
                    {submitting ? 'Please wait...' : { login: 'Login', register: 'Create account', forgot: 'Send reset link', reset: 'Reset password' }[mode]}
                    {!submitting && (mode === 'login' || mode === 'register') && <ArrowRight size={18} />}
                </button>

                {mode === 'login' && <button type="button" onClick={() => { setMessage(''); setMode('forgot'); }} className="mt-4 w-full text-sm font-bold text-[#f2c38b] transition hover:text-[#fff8ef]">Forgot password?</button>}
                {(mode === 'forgot' || mode === 'reset') && <button type="button" onClick={() => { setMessage(''); setMode('login'); }} className="mt-4 w-full text-sm font-bold text-[#f2c38b] transition hover:text-[#fff8ef]">Back to login</button>}

            </div>
        </form>
    );
}

function AuthBenefit({ icon: Icon, title, text }) {
    return (
        <div className="rounded-md bg-[#2a1a12]/12 p-4">
            <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-[#2a1a12] text-[#f2c38b]">
                    <Icon size={18} />
                </span>
                <span className="font-black">{title}</span>
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#3a251a]">{text}</p>
        </div>
    );
}
