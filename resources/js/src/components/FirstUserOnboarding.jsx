import { CheckCircle2, Loader2, ReceiptText, WalletCards } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { readError } from '../lib/format.js';
import { CURRENCY_OPTIONS } from '../lib/currencies.js';
import TransactionForm from './TransactionForm.jsx';
import { Input, Select } from './ui.jsx';

export default function FirstUserOnboarding({ accounts, baseCurrency, categories, onCreated, transactions }) {
    const needsWallet = accounts.length === 0;
    const needsRecord = accounts.length > 0 && transactions.length === 0;
    const [walletForm, setWalletForm] = useState({
        name: '',
        type: 'cash',
        currency: baseCurrency,
        starting_balance: 0,
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setWalletForm((current) => ({ ...current, currency: current.currency || baseCurrency }));
    }, [baseCurrency]);

    if (!needsWallet && !needsRecord) return null;

    async function createWallet(event) {
        event.preventDefault();
        setError('');
        setSaving(true);

        try {
            await api.post('/accounts', walletForm);
            setWalletForm({ name: '', type: 'cash', currency: baseCurrency, starting_balance: 0 });
            onCreated();
        } catch (err) {
            setError(readError(err));
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="overflow-hidden rounded-lg border border-[#8f633e]/55 bg-[#2a1a12] text-[#f8efe3] shadow-xl shadow-black/25">
            <div className="grid gap-0 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="border-b border-[#8f633e]/35 bg-[#3a251a]/88 p-4 sm:p-6 xl:border-b-0 xl:border-r">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">First setup</p>
                    <h2 className="mt-3 text-2xl font-bold tracking-normal text-[#fff8ef] sm:text-3xl">Set up your tracker</h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#d9c4ad]">Start with one wallet, then add one earn or spend record. After that, your dashboard fills itself from your real data.</p>

                    <div className="mt-6 grid gap-3">
                        <SetupStep done={!needsWallet} active={needsWallet} icon={WalletCards} title="Create first wallet" text="Cash, ABA, Wing, savings, or any place you keep money." />
                        <SetupStep done={!needsRecord && !needsWallet} active={needsRecord} icon={ReceiptText} title="Add first money record" text="Record one earn or spend item to begin your history." />
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    {needsWallet && (
                        <form onSubmit={createWallet} className="space-y-4">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#f2c38b]">Wallet</p>
                                <h3 className="mt-2 text-xl font-semibold">Create your first wallet</h3>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input label="Name" value={walletForm.name} onChange={(name) => setWalletForm({ ...walletForm, name })} />
                                <Select label="Type" value={walletForm.type} onChange={(type) => setWalletForm({ ...walletForm, type })} options={[['cash', 'Cash'], ['aba', 'ABA'], ['wing', 'Wing'], ['wallet', 'Wallet'], ['savings', 'Savings']]} />
                                <Select label="Currency" value={walletForm.currency} onChange={(currency) => setWalletForm({ ...walletForm, currency })} options={CURRENCY_OPTIONS} />
                                <Input label="Starting balance" type="number" value={walletForm.starting_balance} onChange={(starting_balance) => setWalletForm({ ...walletForm, starting_balance })} />
                            </div>
                            {error && <p className="rounded-md border border-red-300/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">{error}</p>}
                            <button disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-md bg-[#d7a86e] px-4 font-bold text-[#2a1a12] shadow-lg shadow-black/20 hover:bg-[#e8bb82] disabled:cursor-not-allowed disabled:opacity-60">
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <WalletCards size={18} />}
                                Create wallet
                            </button>
                        </form>
                    )}

                    {needsRecord && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#f2c38b]">First record</p>
                                <h3 className="mt-2 text-xl font-semibold">Add one earn or spend record</h3>
                            </div>
                            <TransactionForm accounts={accounts} baseCurrency={baseCurrency} categories={categories} onCreated={onCreated} />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function SetupStep({ active, done, icon: Icon, text, title }) {
    return (
        <div className={`rounded-md border px-4 py-3 ${active ? 'border-[#d7a86e]/70 bg-[#2a1a12]/65' : 'border-[#8f633e]/45 bg-[#2a1a12]/35'}`}>
            <div className="flex items-start gap-3">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-md ${done ? 'bg-[#244238] text-[#89e6ba]' : 'bg-[#d7a86e] text-[#2a1a12]'}`}>
                    {done ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                </div>
                <div>
                    <p className="font-semibold text-[#fff8ef]">{title}</p>
                    <p className="mt-1 text-sm leading-5 text-[#d9c4ad]">{text}</p>
                </div>
            </div>
        </div>
    );
}
