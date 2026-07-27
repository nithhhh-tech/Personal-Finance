import { useState } from 'react';
import CrudPanel from '../components/CrudPanel.jsx';
import { Input, Select } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { money } from '../lib/format.js';

export default function Accounts({ accounts, onCreated }) {
    const [form, setForm] = useState({ name: '', type: 'cash', currency: 'USD', starting_balance: 0 });

    return (
        <CrudPanel
            title="New wallet"
            onSubmit={async () => {
                await api.post('/accounts', form);
                setForm({ name: '', type: 'cash', currency: 'USD', starting_balance: 0 });
                onCreated();
            }}
            fields={(
                <>
                    <Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
                    <Select label="Type" value={form.type} onChange={(type) => setForm({ ...form, type })} options={[['cash', 'Cash'], ['aba', 'ABA'], ['wing', 'Wing'], ['wallet', 'Wallet'], ['savings', 'Savings']]} />
                    <Select label="Currency" value={form.currency} onChange={(currency) => setForm({ ...form, currency })} options={[['USD', 'USD'], ['KHR', 'KHR']]} />
                    <Input label="Starting balance" type="number" value={form.starting_balance} onChange={(starting_balance) => setForm({ ...form, starting_balance })} />
                </>
            )}
            listTitle="Wallets"
            items={accounts.map((account) => ({
                id: account.id,
                title: account.name,
                meta: `${account.type} / ${account.currency}`,
                value: money(account.current_balance),
            }))}
        />
    );
}
