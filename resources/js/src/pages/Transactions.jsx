import { useState } from 'react';
import { Search } from 'lucide-react';
import TransactionForm from '../components/TransactionForm.jsx';
import { Empty, Panel, Row } from '../components/ui.jsx';
import { money, shortDate } from '../lib/format.js';

export default function Transactions({ transactions, accounts, categories, onCreated }) {
    const [search, setSearch] = useState('');
    const filtered = transactions.filter(
        (item) =>
            (item.description || '').toLowerCase().includes(search.toLowerCase()) ||
            item.category?.name?.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '380px 1fr' }}>
            <Panel title="Add money record">
                <TransactionForm accounts={accounts} categories={categories} onCreated={onCreated} />
            </Panel>

            <Panel title="Money record history">
                <div className="search-bar" style={{ marginBottom: 14 }}>
                    <Search size={16} color="var(--text-sub)" />
                    <input
                        id="tx-search-input"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by description or category"
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filtered.length === 0 && <Empty text="No money records yet." />}
                    {filtered.map((item) => (
                        <Row
                            key={item.id}
                            title={item.description || item.category?.name || 'Transaction'}
                            meta={`${shortDate(item.transaction_date)} · ${item.account?.name || 'Wallet'} · ${item.category?.name || 'Category'}`}
                            value={`${item.type === 'income' ? '+' : '−'}${money(item.base_amount)}`}
                            tone={item.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}
                        />
                    ))}
                </div>
            </Panel>
        </div>
    );
}
