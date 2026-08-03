import { useState } from 'react';
import CrudPanel from '../components/CrudPanel.jsx';
import { PageHeader } from '../components/ui.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.jsx';
import { api } from '../lib/api.js';
import { money } from '../lib/format.js';

export default function Accounts({ accounts, onCreated }) {
    const [form, setForm] = useState({ name: '', type: 'cash', currency: 'USD', starting_balance: 0 });

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Wallets"
                description="Manage cash, ABA, Wing, savings, and other wallets."
            />
            <CrudPanel
            title="New wallet"
            onSubmit={async () => {
                await api.post('/accounts', form);
                setForm({ name: '', type: 'cash', currency: 'USD', starting_balance: 0 });
                onCreated();
            }}
            fields={(
                <>
                    <div className="space-y-2">
                        <Label htmlFor="acc-name">Name</Label>
                        <Input id="acc-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="acc-type">Type</Label>
                        <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                            <SelectTrigger id="acc-type" className="w-full">
                                <SelectValue placeholder="Select type" />
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
                        <Label htmlFor="acc-curr">Currency</Label>
                        <Select value={form.currency} onValueChange={(val) => setForm({ ...form, currency: val })}>
                            <SelectTrigger id="acc-curr" className="w-full">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="KHR">KHR</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="acc-bal">Starting balance</Label>
                        <Input id="acc-bal" type="number" step="any" value={form.starting_balance} onChange={(e) => setForm({ ...form, starting_balance: e.target.value })} required />
                    </div>
                </>
            )}
            listTitle="Wallets"
            items={accounts.map((account) => ({
                id: account.id,
                title: account.name,
                meta: `${account.type.toUpperCase()} / ${account.currency}`,
                value: money(account.current_balance, account.currency),
            }))}
        />
        </div>
    );
}
