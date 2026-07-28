import { useEffect, useState } from 'react';
import { ExternalLink, Send, ShieldCheck, WalletCards, X } from 'lucide-react';
import { api } from '../lib/api.js';
import { readError } from '../lib/format.js';
import { Input, Select } from './ui.jsx';

export default function AuthScreen({ onAuthed }) {
    const [mode, setMode] = useState('welcome');
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
    function scrollToSection(id) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return (
        <main className="h-screen snap-y snap-proximity overflow-y-auto scroll-smooth bg-[#2a1a12] px-4 py-4 text-[#f8efe3] sm:py-6 md:snap-mandatory">
            <nav className="sticky top-2 z-20 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/88 px-3 py-3 shadow-lg shadow-black/10 backdrop-blur sm:top-4 sm:px-4">
                <div className="inline-flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-[#d7a86e] text-[#2a1a12]">
                        <WalletCards size={22} />
                    </div>
                    <div>
                        <p className="font-bold leading-5 text-[#fff8ef]">My Money Tracker</p>
                        <p className="text-xs text-[#d9c4ad]">Daily Spend Tracker</p>
                    </div>
                </div>
                <div className="order-last hidden w-full items-center gap-1 overflow-x-auto rounded-md border border-[#8f633e]/40 bg-[#2a1a12]/45 p-1 lg:order-none lg:flex lg:w-auto">
                    <button type="button" onClick={() => scrollToSection('home')} className="h-9 shrink-0 rounded px-3 text-sm font-semibold text-[#d9c4ad] hover:bg-[#4a3022] hover:text-[#fff8ef]">Home</button>
                    <button type="button" onClick={() => scrollToSection('features')} className="h-9 shrink-0 rounded px-3 text-sm font-semibold text-[#d9c4ad] hover:bg-[#4a3022] hover:text-[#fff8ef]">Features</button>
                    <button type="button" onClick={() => scrollToSection('flow')} className="h-9 rounded px-3 text-sm font-semibold text-[#d9c4ad] hover:bg-[#4a3022] hover:text-[#fff8ef]">How it works</button>
                    <button type="button" onClick={() => scrollToSection('privacy')} className="h-9 rounded px-3 text-sm font-semibold text-[#d9c4ad] hover:bg-[#4a3022] hover:text-[#fff8ef]">Private</button>
                    <button type="button" onClick={() => scrollToSection('contact')} className="h-9 shrink-0 rounded px-3 text-sm font-semibold text-[#d9c4ad] hover:bg-[#4a3022] hover:text-[#fff8ef]">Contact</button>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setMode('login')} className="hidden h-10 rounded-md border border-[#8f633e] px-4 text-sm font-semibold text-[#fff8ef] hover:bg-[#4a3022] sm:block">Login</button>
                    <button type="button" onClick={() => setMode('register')} className="h-10 rounded-md bg-[#d7a86e] px-3 text-sm font-bold text-[#2a1a12] hover:bg-[#e8bb82] sm:px-4">Get Started</button>
                </div>
            </nav>

            <section id="home" className="mx-auto grid min-h-[calc(100vh-8rem)] scroll-mt-24 snap-start max-w-6xl items-center gap-6 py-8 sm:scroll-mt-28 sm:py-10 lg:grid-cols-[1fr_420px] lg:gap-10">
                <div>
                    <div className="max-w-3xl">
                        <p className="inline-flex items-center gap-2 rounded-full border border-[#8f633e] bg-[#3a251a] px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">
                            <WalletCards size={16} />
                            Personal tracker
                        </p>
                        <h2 className="mt-5 text-4xl font-bold leading-tight tracking-normal text-[#fff8ef] sm:text-5xl lg:text-6xl">Track your money before it slips away.</h2>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-[#d9c4ad] sm:text-lg sm:leading-8">A calm personal tracker for what you earn, what you spend, your wallets, and how much money is left each month.</p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <button type="button" onClick={() => setMode('register')} className="h-12 flex-1 rounded-md bg-[#d7a86e] px-5 font-bold text-[#2a1a12] hover:bg-[#e8bb82] sm:flex-none sm:px-6">Start Tracking</button>
                            <button type="button" onClick={() => scrollToSection('features')} className="h-12 flex-1 rounded-md border border-[#8f633e] bg-[#3a251a]/70 px-5 font-semibold text-[#fff8ef] hover:bg-[#4a3022] sm:flex-none sm:px-6">See Features</button>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-[#8f633e]/60 bg-[#3a251a]/75 p-4 shadow-2xl shadow-black/20 sm:p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Built for daily use</p>
                    <h3 className="mt-3 text-2xl font-bold leading-tight text-[#fff8ef] sm:text-3xl">Write it down, then know what is left.</h3>
                    <div className="mt-6 space-y-3">
                        <div className="flex flex-col gap-1 rounded-md border border-[#8f633e]/45 bg-[#2a1a12]/65 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <span className="font-semibold text-[#fff8ef]">Money earned</span>
                            <span className="text-sm text-[#d9c4ad]">Salary, freelance, allowance</span>
                        </div>
                        <div className="flex flex-col gap-1 rounded-md border border-[#8f633e]/45 bg-[#2a1a12]/65 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <span className="font-semibold text-[#fff8ef]">Money spent</span>
                            <span className="text-sm text-[#d9c4ad]">Food, transport, shopping</span>
                        </div>
                        <div className="flex flex-col gap-1 rounded-md border border-[#8f633e]/45 bg-[#2a1a12]/65 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <span className="font-semibold text-[#fff8ef]">Wallets</span>
                            <span className="text-sm text-[#d9c4ad]">Cash, ABA, savings</span>
                        </div>
                    </div>
                    <p className="mt-5 text-sm leading-6 text-[#d9c4ad]">No bank connection and no fake balance on the welcome page. Your real data starts after login.</p>
                </div>
            </section>

            <section id="features" className="mx-auto grid min-h-[calc(100vh-9.5rem)] scroll-mt-28 snap-start max-w-6xl items-center gap-6 border-t border-[#8f633e]/30 py-8 sm:py-10 lg:grid-cols-[0.85fr_1.6fr]">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Features</p>
                    <h3 className="mt-3 text-3xl font-bold leading-tight text-[#fff8ef] sm:text-4xl">Everything for simple daily money tracking.</h3>
                    <p className="mt-4 text-sm leading-7 text-[#d9c4ad]">PocketLedger is for your own records: what came in, what went out, where the money is kept, and what remains.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-4 sm:p-5">
                        <p className="font-semibold text-[#fff8ef]">Income records</p>
                        <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">Add salary, freelance money, allowance, gifts, side income, or any money coming in.</p>
                    </div>
                    <div className="rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-4 sm:p-5">
                        <p className="font-semibold text-[#fff8ef]">Spending records</p>
                        <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">Log food, transport, bills, shopping, subscriptions, school, and small daily expenses.</p>
                    </div>
                    <div className="rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-4 sm:p-5">
                        <p className="font-semibold text-[#fff8ef]">Wallets</p>
                        <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">Separate cash, ABA, Wing, savings, or any other place where you keep money.</p>
                    </div>
                    <div className="rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-4 sm:p-5">
                        <p className="font-semibold text-[#fff8ef]">Categories</p>
                        <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">Group records by food, work, transport, bills, shopping, or custom categories.</p>
                    </div>
                    <div className="rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-4 sm:p-5">
                        <p className="font-semibold text-[#fff8ef]">Monthly overview</p>
                        <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">See total earned, total spent, and how much money is left for the month.</p>
                    </div>
                    <div className="rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-4 sm:p-5">
                        <p className="font-semibold text-[#fff8ef]">Personal notes</p>
                        <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">Add small notes so you remember why a transaction happened later.</p>
                    </div>
                </div>
            </section>

            <section id="flow" className="mx-auto grid min-h-[calc(100vh-9.5rem)] scroll-mt-28 snap-start max-w-6xl items-center gap-6 py-10 lg:grid-cols-[0.85fr_1.6fr]">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">How it works</p>
                    <h3 className="mt-3 text-3xl font-bold leading-tight text-[#fff8ef] sm:text-4xl">A simple flow you can use every day.</h3>
                    <p className="mt-4 text-sm leading-7 text-[#d9c4ad]">No complicated accounting. Just open the tracker, add the record, and check your balance.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">01</p>
                        <h3 className="mt-3 text-xl font-bold text-[#fff8ef]">Create wallets</h3>
                        <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">Add the places your money lives: cash, ABA, Wing, savings, or anything else.</p>
                    </div>
                    <div className="rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">02</p>
                        <h3 className="mt-3 text-xl font-bold text-[#fff8ef]">Set categories</h3>
                        <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">Create groups like food, transport, salary, freelance, bills, and shopping.</p>
                    </div>
                    <div className="rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">03</p>
                        <h3 className="mt-3 text-xl font-bold text-[#fff8ef]">Add transactions</h3>
                        <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">Choose earned or spent, set the amount, category, wallet, date, and note.</p>
                    </div>
                    <div className="rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">04</p>
                        <h3 className="mt-3 text-xl font-bold text-[#fff8ef]">Review totals</h3>
                        <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">See what you earned, what you spent, and what is left without fake demo data.</p>
                    </div>
                </div>
            </section>

            <section id="privacy" className="mx-auto flex min-h-[calc(100vh-9.5rem)] scroll-mt-28 snap-start items-center max-w-6xl py-10">
                <div className="w-full rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Private</p>
                        <h3 className="mt-3 text-3xl font-bold text-[#fff8ef]">Only your own records after login.</h3>
                        <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">The welcome page never shows fake balances. Your real wallets, income, spending, and monthly totals appear only after you sign in.</p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-md border border-[#8f633e]/45 bg-[#2a1a12]/65 p-4">
                                <p className="font-semibold text-[#fff8ef]">Private account</p>
                                <p className="mt-1 text-sm leading-6 text-[#d9c4ad]">Your records belong to your login.</p>
                            </div>
                            <div className="rounded-md border border-[#8f633e]/45 bg-[#2a1a12]/65 p-4">
                                <p className="font-semibold text-[#fff8ef]">No bank link</p>
                                <p className="mt-1 text-sm leading-6 text-[#d9c4ad]">You type only what you want to track.</p>
                            </div>
                            <div className="rounded-md border border-[#8f633e]/45 bg-[#2a1a12]/65 p-4">
                                <p className="font-semibold text-[#fff8ef]">Real dashboard</p>
                                <p className="mt-1 text-sm leading-6 text-[#d9c4ad]">The dashboard uses your saved data.</p>
                            </div>
                        </div>
                    </div>
                    <button type="button" onClick={() => setMode('register')} className="h-11 rounded-md bg-[#d7a86e] px-5 font-bold text-[#2a1a12] hover:bg-[#e8bb82]">Start Tracking</button>
                </div>
                </div>
            </section>

            <section id="contact" className="mx-auto grid min-h-[calc(100vh-9.5rem)] scroll-mt-28 snap-start max-w-6xl items-center gap-4 py-10 md:grid-cols-[1fr_1.2fr]">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Contact</p>
                    <h3 className="mt-3 text-3xl font-bold text-[#fff8ef]">Reach me anytime.</h3>
                    <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">Message me if you need help with your account, want to ask about the tracker, or have an idea to improve it.</p>
                    <p className="mt-4 rounded-md border border-[#8f633e]/45 bg-[#3a251a]/70 p-4 text-sm leading-6 text-[#d9c4ad]">Best way to contact me is Telegram. Facebook is also available if that is easier for you.</p>
                </div>
                <div className="grid gap-3 rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-5 sm:grid-cols-2">
                    <a href="https://t.me/nithhhh_exe" target="_blank" rel="noreferrer" className="flex min-h-24 items-center gap-3 rounded-md border border-[#8f633e]/55 bg-[#2a1a12]/70 px-4 py-3 hover:bg-[#4a3022]">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#d7a86e] text-[#2a1a12]">
                            <Send size={19} />
                        </span>
                        <span>
                            <span className="block font-semibold text-[#fff8ef]">Telegram</span>
                            <span className="mt-1 block text-sm text-[#d9c4ad]">@nithhhh_exe</span>
                        </span>
                    </a>
                    <a href="https://web.facebook.com/its.nithhhh" target="_blank" rel="noreferrer" className="flex min-h-24 items-center gap-3 rounded-md border border-[#8f633e]/55 bg-[#2a1a12]/70 px-4 py-3 hover:bg-[#4a3022]">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#d7a86e] text-[#2a1a12]">
                            <ExternalLink size={19} />
                        </span>
                        <span>
                            <span className="block font-semibold text-[#fff8ef]">Facebook</span>
                            <span className="mt-1 block text-sm text-[#d9c4ad]">its.nithhhh</span>
                        </span>
                    </a>
                </div>
            </section>
        </main>
    );
}

function AuthDrawer({ children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#120b07]/55 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
            <button type="button" aria-label="Close auth drawer" onClick={onClose} className="absolute inset-0 cursor-default" />
            <div className="auth-drawer-panel relative z-10 w-full max-w-md">
                {children}
            </div>
        </div>
    );
}

function AuthForm({ error, form, message, mode, setForm, setMessage, setMode, submit, submitting, onClose }) {
    const titles = {
        login: ['Login', 'Welcome back', 'Continue tracking your real money records.'],
        register: ['Create account', 'Start your money tracker', 'Create your private tracker and start with your first wallet.'],
        forgot: ['Password reset', 'Reset your password', 'Enter your email and we will send a reset link.'],
        reset: ['New password', 'Choose a new password', 'Set a new password for your account.'],
    };
    const [eyebrow, title, text] = titles[mode];
    const showTabs = mode === 'login' || mode === 'register';

    return (
        <form onSubmit={submit} className="max-h-[calc(100vh-1rem)] w-full overflow-y-auto rounded-t-lg border border-[#8f633e]/60 bg-[#3a251a]/95 p-5 text-[#f8efe3] shadow-2xl shadow-black/30 backdrop-blur sm:max-h-[calc(100vh-3rem)] sm:rounded-lg sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
                <button type="button" onClick={onClose} className="text-sm font-semibold text-[#d9c4ad] hover:text-[#fff8ef]">Back to welcome</button>
                <button type="button" aria-label="Close auth drawer" onClick={onClose} className="flex size-9 items-center justify-center rounded-md border border-[#8f633e]/60 text-[#d9c4ad] hover:bg-[#4a3022] hover:text-[#fff8ef]">
                    <X size={18} />
                </button>
            </div>
            <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">{eyebrow}</p>
                <h2 className="mt-2 text-2xl font-bold tracking-normal text-[#fff8ef] sm:text-3xl">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">{text}</p>
            </div>
            {showTabs && (
                <div className="mb-6 flex rounded-md border border-[#8f633e]/50 bg-[#2a1a12]/60 p-1">
                    <button type="button" onClick={() => { setMessage(''); setMode('login'); }} className={`flex-1 rounded px-3 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-[#d7a86e] text-[#2a1a12] shadow-sm' : 'text-[#d9c4ad]'}`}>Login</button>
                    <button type="button" onClick={() => { setMessage(''); setMode('register'); }} className={`flex-1 rounded px-3 py-2 text-sm font-semibold ${mode === 'register' ? 'bg-[#d7a86e] text-[#2a1a12] shadow-sm' : 'text-[#d9c4ad]'}`}>Register</button>
                </div>
            )}
            <div className="space-y-4">
                {mode === 'register' && <Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} variant="dark" />}
                <Input label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} variant="dark" />
                {mode !== 'forgot' && <Input label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} variant="dark" />}
                {mode === 'reset' && <Input label="Confirm password" type="password" value={form.password_confirmation} onChange={(password_confirmation) => setForm({ ...form, password_confirmation })} variant="dark" />}
                {mode === 'register' && <Select label="Base currency" value={form.base_currency} onChange={(base_currency) => setForm({ ...form, base_currency })} options={[['USD', 'USD'], ['KHR', 'KHR']]} variant="dark" />}
            </div>
            {error && <p className="mt-4 rounded-md border border-red-300/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">{error}</p>}
            {message && <p className="mt-4 rounded-md border border-emerald-300/35 bg-emerald-950/35 px-3 py-2 text-sm text-emerald-100">{message}</p>}
            <button disabled={submitting} className="mt-6 h-12 w-full rounded-md bg-[#d7a86e] px-4 font-bold text-[#2a1a12] shadow-lg shadow-black/20 hover:bg-[#e8bb82] disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? 'Please wait...' : { login: 'Login', register: 'Create account', forgot: 'Send reset link', reset: 'Reset password' }[mode]}
            </button>
            {mode === 'login' && <button type="button" onClick={() => { setMessage(''); setMode('forgot'); }} className="mt-4 w-full text-sm font-semibold text-[#f2c38b] hover:text-[#fff8ef]">Forgot password?</button>}
            {(mode === 'forgot' || mode === 'reset') && <button type="button" onClick={() => { setMessage(''); setMode('login'); }} className="mt-4 w-full text-sm font-semibold text-[#f2c38b] hover:text-[#fff8ef]">Back to login</button>}
            <div className="mt-5 flex items-center gap-2 text-xs text-[#d9c4ad]">
                <ShieldCheck size={15} />
                Protected by Laravel Sanctum tokens
            </div>
        </form>
    );
}
