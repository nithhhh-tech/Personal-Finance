import { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { readError, today } from '../lib/format.js';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { Textarea } from './ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group.jsx';

export default function TransactionForm({ accounts, categories, onCreated }) {
    const [form, setForm] = useState({
        type: 'expense',
        account_id: '',
        category_id: '',
        amount: '',
        currency: 'USD',
        exchange_rate: 1,
        transaction_date: today,
        payment_method: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const availableCategories = categories.filter((category) => category.type === form.type);

    useEffect(() => {
        if (!form.account_id && accounts[0]) setForm((current) => ({ ...current, account_id: String(accounts[0].id) }));
    }, [accounts]);

    useEffect(() => {
        const first = availableCategories[0];
        if (first && !availableCategories.some((category) => String(category.id) === String(form.category_id))) {
            setForm((current) => ({ ...current, category_id: String(first.id) }));
        }
    }, [form.type, categories]);

    async function submit(event) {
        event.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await api.post('/transactions', form);
            setForm({ ...form, amount: '', description: '', transaction_date: today });
            onCreated();
        } catch (err) {
            setError(readError(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            {accounts.length === 0 && (
                <Alert>
                    <AlertDescription>Add a wallet before recording money transactions.</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label>Type</Label>
                <ToggleGroup 
                    type="single" 
                    value={form.type} 
                    onValueChange={(val) => val && setForm({ ...form, type: val, category_id: '' })}
                    className="w-full grid grid-cols-2"
                >
                    <ToggleGroupItem value="expense">Spent</ToggleGroupItem>
                    <ToggleGroupItem value="income">Earned</ToggleGroupItem>
                </ToggleGroup>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                        id="amount"
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="wallet">Wallet</Label>
                    <Select
                        value={String(form.account_id)}
                        onValueChange={(val) => setForm({ ...form, account_id: val })}
                    >
                        <SelectTrigger id="wallet" className="w-full">
                            <SelectValue placeholder="Select wallet" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((a) => (
                                <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                        value={String(form.category_id)}
                        onValueChange={(val) => setForm({ ...form, category_id: val })}
                    >
                        <SelectTrigger id="category" className="w-full">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableCategories.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                        id="date"
                        type="date"
                        value={form.transaction_date}
                        onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Input
                    id="payment_method"
                    placeholder="Cash, Card, Transfer..."
                    value={form.payment_method}
                    onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Note</Label>
                <Textarea
                    id="description"
                    placeholder="What was this for?"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Button type="submit" disabled={accounts.length === 0 || submitting} id="save-record-btn" className="gap-2">
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Save Transaction
            </Button>
        </form>
    );
}
