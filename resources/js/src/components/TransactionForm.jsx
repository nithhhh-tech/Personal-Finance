import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../lib/api.js';
import { readError, today } from '../lib/format.js';
import { Empty, Input, Select } from './ui.jsx';

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
    const availableCategories = categories.filter((category) => category.type === form.type);

    useEffect(() => {
        if (!form.account_id && accounts[0]) setForm((current) => ({ ...current, account_id: accounts[0].id }));
    }, [accounts]);

    useEffect(() => {
        const first = availableCategories[0];
        if (first && !availableCategories.some((category) => String(category.id) === String(form.category_id))) {
            setForm((current) => ({ ...current, category_id: first.id }));
        }
    }, [form.type, categories]);

    async function submit(event) {
        event.preventDefault();
        setError('');

        try {
            await api.post('/transactions', form);
            setForm({ ...form, amount: '', description: '', transaction_date: today });
            onCreated();
        } catch (err) {
            setError(readError(err));
        }
    }

    return (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {accounts.length === 0 && <Empty text="Add a wallet before recording money." />}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Select label="Type"   value={form.type}       onChange={(type)       => setForm({ ...form, type, category_id: '' })} options={[['expense', 'Spent'], ['income', 'Earned']]} />
                <Input  label="Amount" type="number" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
                <Select label="Wallet"   value={form.account_id}  onChange={(account_id)  => setForm({ ...form, account_id })}  options={accounts.map((a) => [a.id, a.name])} />
                <Select label="Category" value={form.category_id} onChange={(category_id) => setForm({ ...form, category_id })} options={availableCategories.map((c) => [c.id, c.name])} />
                <Input label="Date"           type="date"  value={form.transaction_date} onChange={(transaction_date) => setForm({ ...form, transaction_date })} />
                <Input label="Payment method" value={form.payment_method}  onChange={(payment_method)  => setForm({ ...form, payment_method })} />
            </div>

            <div>
                <label className="form-label">Note</label>
                <textarea
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    className="form-textarea"
                    placeholder="What was this for?"
                />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button disabled={accounts.length === 0} className="btn-apple-blue" style={{ alignSelf: 'flex-start' }} id="save-record-btn">
                <Plus size={16} />
                Save Transaction
            </button>
        </form>
    );
}
