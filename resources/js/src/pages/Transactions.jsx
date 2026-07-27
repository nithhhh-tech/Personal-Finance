import { useState } from 'react';
import { Search } from 'lucide-react';
import TransactionForm from '../components/TransactionForm.jsx';
import { Empty, Panel, Row } from '../components/ui.jsx';
import { money, shortDate } from '../lib/format.js';

export default function Transactions({ transactions, accounts, categories, onCreated }) {
    const [search, setSearch] = useState('');
    const filtered = transactions.filter((item) => (item.description || '').toLowerCase().includes(search.toLowerCase()) || item.category?.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
            <Panel title="Add money record"><TransactionForm accounts={accounts} categories={categories} onCreated={onCreated} /></Panel>
            <Panel title="Money record history">
                <div className="mb-4 flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-[#f7f9fb] px-3">
                    <Search size={18} className="text-slate-400" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search money records" className="w-full bg-transparent outline-none" />
                </div>
                <div className="space-y-3">
                    {filtered.length === 0 && <Empty text="No money records yet." />}
                    {filtered.map((item) => (
                        <Row key={item.id} title={item.description || item.category?.name || 'Transaction'} meta={`${shortDate(item.transaction_date)} / ${item.account?.name || 'Wallet'} / ${item.category?.name || 'Category'}`} value={`${item.type === 'income' ? '+' : '-'}${money(item.base_amount)}`} tone={item.type === 'income' ? 'text-emerald-700' : 'text-rose-700'} />
                    ))}
                </div>
            </Panel>
        </div>
    );
}
