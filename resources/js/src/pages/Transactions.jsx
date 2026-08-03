import { useState } from 'react';
import { Search } from 'lucide-react';
import TransactionForm from '../components/TransactionForm.jsx';
import { Empty, Panel, TxRow, PageHeader } from '../components/ui.jsx';
import { money, shortDate } from '../lib/format.js';
import { Input } from '../components/ui/input.jsx';

export default function Transactions({ transactions, accounts, categories, onCreated }) {
    const [search, setSearch] = useState('');
    const filtered = transactions.filter(
        (item) =>
            (item.description || '').toLowerCase().includes(search.toLowerCase()) ||
            item.category?.name?.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Transactions"
                description="Add a record or search your money history."
            />
            <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
            <Panel title="Add money record">
                <TransactionForm accounts={accounts} categories={categories} onCreated={onCreated} />
            </Panel>

            <Panel title="Money record history">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                        id="tx-search-input"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by description or category"
                        className="pl-9"
                    />
                </div>
                <div className="flex flex-col gap-2.5">
                    {filtered.length === 0 && <Empty text="No money records found." />}
                    {filtered.map((item) => (
                        <TxRow
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
        </div>
    );
}
