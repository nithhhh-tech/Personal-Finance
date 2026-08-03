import { CheckCircle2, Loader2, ReceiptText, WalletCards } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { readError } from '../lib/format.js';
import TransactionForm from './TransactionForm.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.jsx';
import { Button } from './ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';

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
        <Card className="overflow-hidden shadow-lg border">
            <div className="grid gap-0 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="border-b bg-muted/40 p-6 xl:border-b-0 xl:border-r">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First setup</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight">Set up your tracker</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Start with one wallet, then add one earn or spend record.</p>

                    <div className="mt-6 grid gap-3">
                        <SetupStep done={!needsWallet} active={needsWallet} icon={WalletCards} title="Create first wallet" text="Cash, ABA, Wing, or savings." />
                        <SetupStep done={!needsRecord && !needsWallet} active={needsRecord} icon={ReceiptText} title="Add first money record" text="Record one item to begin your history." />
                    </div>
                </div>

                <div className="p-6">
                    {needsWallet && (
                        <form onSubmit={createWallet} className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">Create your first wallet</h3>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input value={walletForm.name} onChange={(e) => setWalletForm({ ...walletForm, name: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={walletForm.type} onValueChange={(val) => setWalletForm({ ...walletForm, type: val })}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="aba">ABA</SelectItem>
                                            <SelectItem value="wing">Wing</SelectItem>
                                            <SelectItem value="wallet">Wallet</SelectItem>
                                            <SelectItem value="savings">Savings</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Currency</Label>
                                    <Select value={walletForm.currency} onValueChange={(val) => setWalletForm({ ...walletForm, currency: val })}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="KHR">KHR</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Starting balance</Label>
                                    <Input type="number" step="any" value={walletForm.starting_balance} onChange={(e) => setWalletForm({ ...walletForm, starting_balance: e.target.value })} required />
                                </div>
                            </div>
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <Button disabled={saving} className="gap-2">
                                {saving ? <Loader2 className="size-4 animate-spin" /> : <WalletCards className="size-4" />}
                                Create wallet
                            </Button>
                        </form>
                    )}

                    {needsRecord && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">Add one earn or spend record</h3>
                            </div>
                            <TransactionForm accounts={accounts} baseCurrency={baseCurrency} categories={categories} onCreated={onCreated} />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}

function SetupStep({ active, done, icon: Icon, text, title }) {
    return (
        <div className={`rounded-lg border p-3.5 transition-colors ${active ? 'border-primary bg-primary/5' : 'border-border/50 bg-card'}`}>
            <div className="flex items-start gap-3">
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-md ${done ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-primary text-primary-foreground'}`}>
                    {done ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
                </div>
                <div>
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{text}</p>
                </div>
            </div>
        </div>
    );
}
