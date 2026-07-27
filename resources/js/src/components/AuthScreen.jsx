import { useState } from 'react';
import { Coffee, Moon, ShieldCheck, Sun } from 'lucide-react';
import { api } from '../lib/api.js';
import { readError } from '../lib/format.js';
import { Input, PreviewRow, PreviewStat, Select, WelcomePoint } from './ui.jsx';

export default function AuthScreen({ onAuthed, darkMode, toggleTheme }) {
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
            const payload  = mode === 'login' ? { email: form.email, password: form.password } : form;
            const response = await api.post(endpoint, payload);
            onAuthed(response.data.token);
        } catch (err) {
            setError(readError(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="auth-screen">
            <div className="auth-bg-blob" />
            
            {/* Theme Toggle Top Right */}
            <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 20 }}>
                <button
                    onClick={toggleTheme}
                    className="theme-toggle-btn"
                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {darkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-600" />}
                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
            </div>

            <div className="auth-grid">
                {/* ── Left Column ── */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    {/* Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div className="brand-icon" style={{ width: 48, height: 48, borderRadius: 14 }}>
                            <Coffee size={24} strokeWidth={2.2} />
                        </div>
                        <div>
                            <p style={{ fontWeight: 800, fontSize: 18, color: 'var(--apple-dark)', lineHeight: 1.2 }}>Brew Ledger</p>
                            <p style={{ fontSize: 12.5, color: 'var(--apple-sub)', marginTop: 2 }}>Coffee House Style</p>
                        </div>
                    </div>

                    {/* Headline */}
                    <div>
                        <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--coffee-accent)', marginBottom: 10 }}>
                            Personal Finance
                        </p>
                        <h1 style={{ fontSize: 'clamp(38px, 4.2vw, 54px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.08, color: 'var(--apple-dark)', margin: 0, marginBottom: 14 }}>
                            Know exactly where your money goes.
                        </h1>
                        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--apple-sub)', maxWidth: 460 }}>
                            Record your income, track every spending, and monitor your wallet balances in a cozy, coffee-themed interface.
                        </p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
                            <button type="button" onClick={() => setMode('register')} className="btn-apple-blue" id="auth-create-btn">
                                Create account
                            </button>
                            <button type="button" onClick={() => setMode('login')} className="btn-outline" id="auth-login-btn" style={{ height: 44 }}>
                                Log in
                            </button>
                        </div>
                    </div>


                    {/* Preview Card */}
                    <div className="auth-preview-card">
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                            <div>
                                <p style={{ fontSize: 13, color: 'var(--apple-sub)', marginBottom: 4 }}>Money left</p>
                                <p className="auth-hero-balance">$1,284.50</p>
                            </div>
                            <div style={{ background: 'rgba(52, 199, 89, 0.12)', color: '#28CD41', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 700 }}>
                                +12.4%
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                            <PreviewStat label="Earned" value="$620"  tone="emerald" />
                            <PreviewStat label="Spent"  value="$238"  tone="rose" />
                            <PreviewStat label="Left"   value="$382"  tone="blue" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <PreviewRow title="Lunch at work"          meta="Food / ABA"    value="-$5.50"    tone="text-rose-700" />
                            <PreviewRow title="Salary / freelance"     meta="Earned / ABA"  value="+$120.00"  tone="text-emerald-700" />
                            <PreviewRow title="Moto gas"               meta="Transport / Cash" value="-$8.00" tone="text-rose-700" />
                        </div>
                    </div>
                </section>

                {/* ── Right Column ── */}
                {mode === 'welcome' ? <WelcomeCard setMode={setMode} /> : (
                    <AuthForm error={error} form={form} mode={mode} setForm={setForm} setMode={setMode} submit={submit} submitting={submitting} />
                )}
            </div>
        </main>
    );
}

function WelcomeCard({ setMode }) {
    return (
        <section className="auth-form-card" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
                <p style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--apple-sub)', marginBottom: 8 }}>
                    Start tracking
                </p>
                <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--apple-dark)', margin: 0, lineHeight: 1.15 }}>
                    Your money, written down clearly.
                </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <WelcomePoint title="Earned" text="Record salary, freelance work, allowance, or any money coming in." />
                <WelcomePoint title="Spent"  text="Add food, transport, bills, shopping, and everyday spending." />
                <WelcomePoint title="Left"   text="See the balance left across cash, ABA, Wing, and savings wallets." />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setMode('register')} className="btn-apple-blue full" id="welcome-create-btn">
                    Create your tracker
                </button>
                <button type="button" onClick={() => setMode('login')} className="btn-outline" style={{ width: '100%', justifyContent: 'center', height: 44 }} id="welcome-login-btn">
                    I already have an account
                </button>
            </div>
        </section>
    );
}

function AuthForm({ error, form, mode, setForm, setMode, submit, submitting }) {
    return (
        <form onSubmit={submit} className="auth-form-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <button type="button" onClick={() => setMode('welcome')} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', fontSize: 13.5, fontWeight: 600, color: 'var(--apple-sub)', padding: 0, marginBottom: 20, cursor: 'pointer' }}>
                ← Back
            </button>

            <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--coffee-accent)', marginBottom: 6 }}>
                    {mode === 'login' ? 'Login' : 'Create account'}
                </p>
                <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--apple-dark)', margin: 0, lineHeight: 1.2 }}>
                    {mode === 'login' ? 'Welcome back' : 'Start your money tracker'}
                </h2>
            </div>

            <div className="auth-tab-bar">
                <button type="button" onClick={() => setMode('login')}    className={`auth-tab${mode === 'login'    ? ' active' : ''}`} id="tab-login">Log in</button>
                <button type="button" onClick={() => setMode('register')} className={`auth-tab${mode === 'register' ? ' active' : ''}`} id="tab-register">Register</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {mode === 'register' && <Input label="Name"     value={form.name}     onChange={(name)     => setForm({ ...form, name })} />}
                <Input label="Email"    type="email"    value={form.email}    onChange={(email)    => setForm({ ...form, email })} />
                <Input label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
                {mode === 'register' && (
                    <Select label="Base currency" value={form.base_currency} onChange={(base_currency) => setForm({ ...form, base_currency })} options={[['USD', 'USD – US Dollar'], ['KHR', 'KHR – Cambodian Riel']]} />
                )}
            </div>

            {error && <p className="form-error" style={{ marginTop: 16 }}>{error}</p>}

            <button disabled={submitting} className="btn-apple-blue full" style={{ marginTop: 22 }} id="auth-submit-btn">
                {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>

            <div className="security-badge">
                <ShieldCheck size={15} />
                Protected by Laravel Sanctum tokens
            </div>
        </form>
    );
}
