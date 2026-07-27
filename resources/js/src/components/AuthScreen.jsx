import { useState } from 'react';
import { ShieldCheck, WalletCards } from 'lucide-react';
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
    return (
        <main className="min-h-screen app-bg px-4 py-8 text-[#172033]">
            <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center">
                <div className="inline-flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-[#14211d] text-white">
                        <WalletCards size={26} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold tracking-normal">My Money Tracker</h1>
                        <p className="text-slate-500">Record what you earned, what you spent, and what is left.</p>
                    </div>
                </div>

                <div className="mt-12 grid items-center gap-8 lg:grid-cols-[1fr_430px]">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Welcome</p>
                        <h2 className="mt-3 max-w-4xl text-6xl font-bold leading-tight tracking-normal text-[#14211d]">Know where your money goes before the month disappears.</h2>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">A simple private tracker for daily earned money, spending records, wallets, and monthly money left.</p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <button type="button" onClick={() => setMode('register')} className="h-12 rounded-md bg-[#18b875] px-5 font-semibold text-white shadow-lg shadow-emerald-200/70 hover:bg-[#119662]">Create account</button>
                            <button type="button" onClick={() => setMode('login')} className="h-12 rounded-md border border-slate-200 bg-white/90 px-5 font-semibold text-slate-800 shadow-sm hover:bg-white">Login</button>
                        </div>
                    </div>

                    <div className="rounded-lg border border-white bg-white/95 p-6 shadow-xl shadow-slate-300/50 backdrop-blur">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">What you can track</p>
                        <div className="mt-6 space-y-3">
                            <WelcomePoint title="Earned" text="Record salary, freelance work, allowance, or any money coming in." />
                            <WelcomePoint title="Spent" text="Add food, transport, bills, shopping, and everyday spending." />
                            <WelcomePoint title="Wallets" text="Track cash, ABA, Wing, savings, and any place you keep money." />
                            <WelcomePoint title="Monthly left" text="See what remains after earned money minus spent money." />
                        </div>
                    </div>
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
