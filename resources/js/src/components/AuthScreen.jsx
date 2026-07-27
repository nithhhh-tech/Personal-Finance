import { useState } from 'react';
import { Coffee, ShieldCheck, WalletCards } from 'lucide-react';
import { api } from '../lib/api.js';
import { readError } from '../lib/format.js';
import { Input, Select, WelcomePoint } from './ui.jsx';

export default function AuthScreen({ onAuthed }) {
    const [mode, setMode] = useState('welcome');
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

    if (mode === 'welcome') {
        return <LandingPage setMode={setMode} />;
    }

    return (
        <main className="min-h-screen app-bg px-4 py-8 text-[#172033]">
            <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-8 lg:grid-cols-[1fr_440px]">
                <section className="space-y-7">
                    <div className="inline-flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-[#14211d] text-white">
                            <WalletCards size={26} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-normal">My Money Tracker</h1>
                            <p className="text-slate-500">Record what you earned, what you spent, and what is left.</p>
                        </div>
                    </div>
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">{mode === 'login' ? 'Login' : 'Create account'}</p>
                        <h2 className="mt-3 text-5xl font-bold leading-tight tracking-normal text-[#14211d]">{mode === 'login' ? 'Welcome back.' : 'Start tracking your money.'}</h2>
                        <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">{mode === 'login' ? 'Sign in to continue recording what you earned, what you spent, and what is left.' : 'Create your private tracker and start with your first wallet and money record.'}</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <button type="button" onClick={() => setMode('register')} className="h-12 rounded-md bg-[#18b875] px-5 font-semibold text-white shadow-lg shadow-emerald-200/70 hover:bg-[#119662]">Create account</button>
                            <button type="button" onClick={() => setMode('login')} className="h-12 rounded-md border border-slate-200 bg-white/90 px-5 font-semibold text-slate-800 shadow-sm hover:bg-white">Login</button>
                        </div>
                    </div>
                    <WelcomeFeatureGrid />
                </section>

                <AuthForm error={error} form={form} mode={mode} setForm={setForm} setMode={setMode} submit={submit} submitting={submitting} />
            </div>
        </main>
    );
}

function LandingPage({ setMode }) {
    function scrollToSection(id) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return (
        <main className="min-h-screen bg-[#2a1a12] px-4 py-6 text-[#f8efe3]">
            <nav className="sticky top-4 z-20 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/85 px-4 py-3 shadow-lg shadow-black/10 backdrop-blur">
                <div className="inline-flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-[#d7a86e] text-[#2a1a12]">
                        <WalletCards size={22} />
                    </div>
                    <div>
                        <p className="font-bold leading-5 text-[#fff8ef]">My Money Tracker</p>
                        <p className="text-xs text-[#d9c4ad]">Daily Spend Tracker</p>
                    </div>
                </div>
                <div className="order-last flex w-full items-center gap-1 overflow-x-auto rounded-md border border-[#8f633e]/40 bg-[#2a1a12]/45 p-1 lg:order-none lg:w-auto">
                    <button type="button" onClick={() => scrollToSection('home')} className="h-9 shrink-0 rounded px-3 text-sm font-semibold text-[#d9c4ad] hover:bg-[#4a3022] hover:text-[#fff8ef]">Home</button>
                    <button type="button" onClick={() => scrollToSection('features')} className="h-9 shrink-0 rounded px-3 text-sm font-semibold text-[#d9c4ad] hover:bg-[#4a3022] hover:text-[#fff8ef]">Features</button>
                    <button type="button" onClick={() => scrollToSection('flow')} className="h-9 rounded px-3 text-sm font-semibold text-[#d9c4ad] hover:bg-[#4a3022] hover:text-[#fff8ef]">How it works</button>
                    <button type="button" onClick={() => scrollToSection('privacy')} className="h-9 rounded px-3 text-sm font-semibold text-[#d9c4ad] hover:bg-[#4a3022] hover:text-[#fff8ef]">Private</button>
                    <button type="button" onClick={() => scrollToSection('contact')} className="h-9 shrink-0 rounded px-3 text-sm font-semibold text-[#d9c4ad] hover:bg-[#4a3022] hover:text-[#fff8ef]">Contact</button>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setMode('login')} className="hidden h-10 rounded-md border border-[#8f633e] px-4 text-sm font-semibold text-[#fff8ef] hover:bg-[#4a3022] sm:block">Login</button>
                    <button type="button" onClick={() => setMode('register')} className="hidden h-10 rounded-md border border-[#8f633e] px-4 text-sm font-semibold text-[#f2c38b] hover:bg-[#4a3022] sm:block">Register</button>
                    <button type="button" onClick={() => setMode('register')} className="h-10 rounded-md bg-[#d7a86e] px-4 text-sm font-bold text-[#2a1a12] hover:bg-[#e8bb82]">Get Started</button>
                </div>
            </nav>

            <section id="home" className="mx-auto grid min-h-[calc(100vh-9.5rem)] scroll-mt-28 max-w-6xl items-center gap-10 lg:grid-cols-[1fr_420px]">
                <div>
                    <div className="max-w-3xl">
                        <p className="inline-flex items-center gap-2 rounded-full border border-[#8f633e] bg-[#3a251a] px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">
                            <Coffee size={16} />
                            Welcome
                        </p>
                        <h2 className="mt-5 text-6xl font-bold leading-tight tracking-normal text-[#fff8ef]">Track your money before it slips away.</h2>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d9c4ad]">A calm personal tracker for what you earn, what you spend, your wallets, and how much money is left each month.</p>
                    </div>
                </div>

                <div className="rounded-lg border border-[#8f633e]/70 bg-[#3a251a]/90 p-6 shadow-2xl shadow-black/30 backdrop-blur">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">What you can track</p>
                    <h3 className="mt-3 text-3xl font-bold text-[#fff8ef]">Simple daily money notes.</h3>
                    <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">No bank connection. No complicated accounting. Just your own records.</p>
                    <div className="mt-6 space-y-3">
                        <div className="rounded-md border border-[#8f633e]/60 bg-[#2a1a12]/70 p-4">
                            <p className="font-semibold text-[#fff8ef]">Earned</p>
                            <p className="mt-1 text-sm leading-6 text-[#d9c4ad]">Salary, freelance work, allowance, and any money coming in.</p>
                        </div>
                        <div className="rounded-md border border-[#8f633e]/60 bg-[#2a1a12]/70 p-4">
                            <p className="font-semibold text-[#fff8ef]">Spent</p>
                            <p className="mt-1 text-sm leading-6 text-[#d9c4ad]">Food, transport, bills, shopping, and everyday spending.</p>
                        </div>
                        <div className="rounded-md border border-[#8f633e]/60 bg-[#2a1a12]/70 p-4">
                            <p className="font-semibold text-[#fff8ef]">Wallets</p>
                            <p className="mt-1 text-sm leading-6 text-[#d9c4ad]">Cash, ABA, Wing, savings, or anywhere you keep money.</p>
                        </div>
                    </div>
                    <button type="button" onClick={() => setMode('register')} className="mt-6 h-11 w-full rounded-md bg-[#d7a86e] font-bold text-[#2a1a12] hover:bg-[#e8bb82]">Get Started</button>
                </div>
            </section>

            <section id="features" className="mx-auto grid scroll-mt-28 max-w-6xl gap-4 border-t border-[#8f633e]/30 py-12 md:grid-cols-3">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Features</p>
                    <h3 className="mt-3 text-3xl font-bold text-[#fff8ef]">Record the money story of each day.</h3>
                </div>
                <div className="rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-5">
                    <p className="font-semibold text-[#fff8ef]">Income</p>
                    <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">Add salary, freelance money, allowance, gifts, or side income.</p>
                </div>
                <div className="rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-5">
                    <p className="font-semibold text-[#fff8ef]">Spending</p>
                    <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">Log food, transport, bills, shopping, subscriptions, and small daily expenses.</p>
                </div>
            </section>

            <section id="flow" className="mx-auto grid scroll-mt-28 max-w-6xl gap-4 py-8 md:grid-cols-3">
                <div className="rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">01</p>
                    <h3 className="mt-3 text-xl font-bold text-[#fff8ef]">Create wallets</h3>
                    <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">Cash, ABA, Wing, savings, or any place where your money lives.</p>
                </div>
                <div className="rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">02</p>
                    <h3 className="mt-3 text-xl font-bold text-[#fff8ef]">Add transactions</h3>
                    <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">Choose earned or spent, set the amount, category, wallet, and date.</p>
                </div>
                <div className="rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">03</p>
                    <h3 className="mt-3 text-xl font-bold text-[#fff8ef]">See what is left</h3>
                    <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">Your dashboard keeps the totals clear without bank connection or fake demo data.</p>
                </div>
            </section>

            <section id="privacy" className="mx-auto mb-8 scroll-mt-28 rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-6 max-w-6xl">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Private</p>
                        <h3 className="mt-3 text-3xl font-bold text-[#fff8ef]">Only your own records after login.</h3>
                        <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">The landing page stays clean. Your real wallets, income, spending, and balance appear only after you sign in.</p>
                    </div>
                    <button type="button" onClick={() => setMode('register')} className="h-11 rounded-md bg-[#d7a86e] px-5 font-bold text-[#2a1a12] hover:bg-[#e8bb82]">Start Tracking</button>
                </div>
            </section>

            <section id="contact" className="mx-auto mb-12 grid scroll-mt-28 max-w-6xl gap-4 py-4 md:grid-cols-[1fr_1.2fr]">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Contact</p>
                    <h3 className="mt-3 text-3xl font-bold text-[#fff8ef]">Need to get back in?</h3>
                    <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">Use Login if you already have an account, or Register if this is your first time tracking your money here.</p>
                </div>
                <div className="flex flex-col gap-3 rounded-lg border border-[#8f633e]/50 bg-[#3a251a]/70 p-5 sm:flex-row sm:items-center sm:justify-end">
                    <button type="button" onClick={() => setMode('login')} className="h-11 rounded-md border border-[#8f633e] px-5 font-semibold text-[#fff8ef] hover:bg-[#4a3022]">Login</button>
                    <button type="button" onClick={() => setMode('register')} className="h-11 rounded-md bg-[#d7a86e] px-5 font-bold text-[#2a1a12] hover:bg-[#e8bb82]">Create Account</button>
                </div>
            </section>
        </main>
    );
}

function WelcomeFeatureGrid() {
    return (
        <div className="grid gap-3 sm:grid-cols-3">
            <WelcomePoint title="Earned" text="Money coming in." />
            <WelcomePoint title="Spent" text="Money going out." />
            <WelcomePoint title="Left" text="Your remaining balance." />
        </div>
    );
}

function AuthForm({ error, form, mode, setForm, setMode, submit, submitting }) {
    return (
        <form onSubmit={submit} className="rounded-lg border border-white bg-white/95 p-6 shadow-xl shadow-slate-300/50 backdrop-blur">
            <button type="button" onClick={() => setMode('welcome')} className="mb-5 text-sm font-semibold text-slate-500 hover:text-slate-900">Back to welcome</button>
            <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">{mode === 'login' ? 'Login' : 'Create account'}</p>
                <h2 className="mt-2 text-3xl font-bold tracking-normal text-[#14211d]">{mode === 'login' ? 'Welcome back' : 'Start your money tracker'}</h2>
            </div>
            <div className="mb-6 flex rounded-md bg-slate-100 p-1">
                <button type="button" onClick={() => setMode('login')} className={`flex-1 rounded px-3 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>Login</button>
                <button type="button" onClick={() => setMode('register')} className={`flex-1 rounded px-3 py-2 text-sm font-semibold ${mode === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>Register</button>
            </div>
            <div className="space-y-4">
                {mode === 'register' && <Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />}
                <Input label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
                <Input label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
                {mode === 'register' && <Select label="Base currency" value={form.base_currency} onChange={(base_currency) => setForm({ ...form, base_currency })} options={[['USD', 'USD'], ['KHR', 'KHR']]} />}
            </div>
            {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button disabled={submitting} className="mt-6 h-12 w-full rounded-md bg-[#18b875] px-4 font-semibold text-white shadow-lg shadow-emerald-200/70 hover:bg-[#119662] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}</button>
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={15} />
                Protected by Laravel Sanctum tokens
            </div>
        </form>
    );
}
