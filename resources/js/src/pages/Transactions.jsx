import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Loader2, Plus, RotateCcw, Search, Trash2, X } from 'lucide-react';
import { api } from '../lib/api.js';
import { toast } from '../components/Toast.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import { Empty, Panel, Row } from '../components/ui.jsx';
import { money, readError, shortDate } from '../lib/format.js';

export default function Transactions({ transactions, accounts, baseCurrency, categories, onCreated }) {
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ type: '', account_id: '', category_id: '', from: '', to: '' });
    const [page, setPage] = useState(1);
    const [serverTransactions, setServerTransactions] = useState(Array.isArray(transactions) ? transactions : []);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: Array.isArray(transactions) ? transactions.length : 0 });
    const [historyLoading, setHistoryLoading] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [editClosing, setEditClosing] = useState(false);
    const [editSaving, setEditSaving] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [duplicatingId, setDuplicatingId] = useState(null);

    const safeTransactions = Array.isArray(serverTransactions) ? serverTransactions : [];

    useEffect(() => {
        setServerTransactions(Array.isArray(transactions) ? transactions : []);
    }, [transactions]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            loadTransactions(page);
        }, 250);

        return () => window.clearTimeout(timeout);
    }, [search, filters, page]);

    async function loadTransactions(nextPage = 1) {
        setHistoryLoading(true);

        try {
            const response = await api.get('/transactions', {
                params: {
                    page: nextPage,
                    search: search || undefined,
                    type: filters.type || undefined,
                    account_id: filters.account_id || undefined,
                    category_id: filters.category_id || undefined,
                    from: filters.from || undefined,
                    to: filters.to || undefined,
                },
            });
            const payload = response.data;
            const dataList = Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);
            setServerTransactions(dataList);
            setPagination({
                current_page: payload.current_page || 1,
                last_page: payload.last_page || 1,
                total: payload.total ?? dataList.length,
            });
        } catch (err) {
            toast(readError(err) || 'Could not load money records.', 'error');
        } finally {
            setHistoryLoading(false);
        }
    }

    function updateFilter(key, value) {
        setFilters((current) => ({ ...current, [key]: value }));
        setPage(1);
    }

    function closeEditDrawer() {
        setEditClosing(true);
        window.setTimeout(() => {
            setEditingTransaction(null);
            setEditClosing(false);
        }, 320);
    }

    function handleUpdated() {
        onCreated();
        loadTransactions(page);
        closeEditDrawer();
    }

    function handleCreated() {
        onCreated();
        setPage(1);
        loadTransactions(1);
    }

    async function deleteTransaction() {
        if (!pendingDelete) return;

        setDeletingId(pendingDelete.id);
        try {
            await api.delete(`/transactions/${pendingDelete.id}`);
            toast('Money record deleted.', 'info');
            onCreated();
            loadTransactions(page);
            setPendingDelete(null);
        } catch (err) {
            toast(readError(err) || 'Could not delete record.', 'error');
        } finally {
            setDeletingId(null);
        }
    }

    async function duplicateTransaction(item) {
        setDuplicatingId(item.id);
        try {
            await api.post(`/transactions/${item.id}/duplicate`);
            toast('Money record duplicated for today!', 'success');
            onCreated();
            loadTransactions(page);
        } catch (err) {
            toast('Could not duplicate record.', 'error');
        } finally {
            setDuplicatingId(null);
        }
    }

    return (
        <>
            {/* Mobile hint bar — visible only on small screens */}
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#8f633e]/40 bg-[#3a251a]/70 px-4 py-3 xl:hidden">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#d7a86e] text-[#2a1a12]">
                    <Plus size={18} strokeWidth={2.8} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-[#fff8ef]">Tap <span className="text-[#f2c38b]">+</span> below to add a record</p>
                    <p className="text-xs text-[#b89a7f]">Use the centre button in the bottom bar</p>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
                {/* Add form — hidden on mobile, shown side-by-side on xl+ */}
                <div className="hidden xl:block">
                    <Panel title="Add money record"><TransactionForm accounts={accounts} baseCurrency={baseCurrency} categories={categories} onCreated={handleCreated} /></Panel>
                </div>

                <Panel title="Money record history">
                    {/* Filters */}
                    <div className="mb-4 space-y-2.5">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="flex h-10 items-center gap-2 rounded-md border border-[#8f633e]/60 bg-[#2a1a12]/70 px-3">
                                <Search size={16} className="shrink-0 text-[#d9c4ad]" />
                                <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search records..." className="w-full bg-transparent text-xs text-[#fff8ef] outline-none placeholder:text-[#b89a7f] sm:text-sm" />
                            </div>
                            <select value={filters.type} onChange={(event) => updateFilter('type', event.target.value)} className="h-10 rounded-md border border-[#8f633e]/60 bg-[#2a1a12]/70 px-2.5 text-xs text-[#fff8ef] outline-none sm:text-sm">
                                <option value="">All types</option>
                                <option value="income">Earned</option>
                                <option value="expense">Spent</option>
                            </select>
                            <select value={filters.account_id} onChange={(event) => updateFilter('account_id', event.target.value)} className="h-10 rounded-md border border-[#8f633e]/60 bg-[#2a1a12]/70 px-2.5 text-xs text-[#fff8ef] outline-none sm:text-sm">
                                <option value="">All wallets</option>
                                {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                            </select>
                            <select value={filters.category_id} onChange={(event) => updateFilter('category_id', event.target.value)} className="h-10 rounded-md border border-[#8f633e]/60 bg-[#2a1a12]/70 px-2.5 text-xs text-[#fff8ef] outline-none sm:text-sm">
                                <option value="">All categories</option>
                                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#d9c4ad]">
                            <span className="font-semibold text-[#f2c38b]">Date:</span>
                            <input type="date" value={filters.from} onChange={(event) => updateFilter('from', event.target.value)} className="h-9 rounded-md border border-[#8f633e]/60 bg-[#2a1a12]/70 px-2 text-xs text-[#fff8ef] outline-none" />
                            <span>to</span>
                            <input type="date" value={filters.to} onChange={(event) => updateFilter('to', event.target.value)} className="h-9 rounded-md border border-[#8f633e]/60 bg-[#2a1a12]/70 px-2 text-xs text-[#fff8ef] outline-none" />
                            {(search || filters.type || filters.account_id || filters.category_id || filters.from || filters.to) && (
                                <button
                                    type="button"
                                    onClick={() => { setSearch(''); setFilters({ type: '', account_id: '', category_id: '', from: '', to: '' }); setPage(1); }}
                                    className="ml-auto inline-flex h-8 items-center gap-1 rounded-md border border-[#8f633e]/50 bg-[#3a251a] px-2.5 text-xs font-semibold text-[#f2c38b] hover:bg-[#4a3022]"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </div>

                    {historyLoading && <div className="mb-3 flex h-10 items-center gap-2 rounded-md border border-[#8f633e]/45 bg-[#2a1a12]/60 px-3 text-sm text-[#d9c4ad]"><Loader2 size={16} className="animate-spin text-[#f2c38b]" />Loading records...</div>}
                    <div className="space-y-3">
                        {safeTransactions.length === 0 && <Empty text="No money records yet." />}
                        {safeTransactions.map((item) => (
                            <Row
                                key={item.id}
                                title={item.description || item.category?.name || 'Transaction'}
                                meta={`${shortDate(item.transaction_date)} / ${item.account?.name || 'Wallet'} / ${item.category?.name || 'Category'}${item.sub_category?.name || item.subCategory?.name ? ` › ${item.sub_category?.name || item.subCategory?.name}` : ''}`}
                                value={`${item.type === 'income' ? '+' : '-'}${money(item.base_amount, baseCurrency)}`}
                                tone={item.type === 'income' ? 'text-[#89e6ba]' : 'text-[#f0a36f]'}
                                action={(
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditClosing(false);
                                                setEditingTransaction(item);
                                            }}
                                            className="flex size-9 items-center justify-center rounded-md border border-[#8f633e]/55 bg-[#3a251a] text-[#d9c4ad] hover:border-[#d7a86e]/70 hover:text-[#fff8ef]"
                                            aria-label="Edit money record"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={duplicatingId === item.id}
                                            onClick={() => duplicateTransaction(item)}
                                            className="inline-flex h-9 items-center gap-1 rounded-md border border-[#8f633e]/70 bg-[#3a251a] px-2.5 text-xs font-extrabold text-[#f2c38b] hover:border-[#d7a86e] hover:bg-[#4a3022] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 transition shadow-sm"
                                            aria-label="Repeat money record for today"
                                            title="Repeat this expense/income for today"
                                        >
                                            {duplicatingId === item.id ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                                            Repeat
                                        </button>
                                        <button
                                            type="button"
                                            disabled={deletingId === item.id}
                                            onClick={() => setPendingDelete(item)}
                                            className="flex size-9 items-center justify-center rounded-md border border-red-300/35 bg-red-950/25 text-red-100 hover:border-red-200/70 hover:bg-red-900/45 disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Delete money record"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                            />
                        ))}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#d9c4ad]">
                        <p>{pagination.total} records</p>
                        <div className="flex items-center gap-2">
                            <button type="button" disabled={pagination.current_page <= 1 || historyLoading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex size-9 items-center justify-center rounded-md border border-[#8f633e]/55 bg-[#2a1a12]/60 hover:bg-[#4a3022] disabled:cursor-not-allowed disabled:opacity-50" aria-label="Previous page">
                                <ChevronLeft size={17} />
                            </button>
                            <span>Page {pagination.current_page} of {pagination.last_page}</span>
                            <button type="button" disabled={pagination.current_page >= pagination.last_page || historyLoading} onClick={() => setPage((current) => current + 1)} className="flex size-9 items-center justify-center rounded-md border border-[#8f633e]/55 bg-[#2a1a12]/60 hover:bg-[#4a3022] disabled:cursor-not-allowed disabled:opacity-50" aria-label="Next page">
                                <ChevronRight size={17} />
                            </button>
                        </div>
                    </div>
                </Panel>
            </div>

            {editingTransaction && (
                <div className={`quick-drawer-backdrop fixed inset-0 z-40 flex justify-end bg-black/45 backdrop-blur-sm ${editClosing ? 'quick-drawer-backdrop-out' : ''}`}>
                    <section className={`quick-drawer-panel h-full w-full overflow-y-auto border-l border-[#8f633e]/55 bg-[#3a251a] p-4 text-[#f8efe3] shadow-2xl shadow-black/45 sm:max-w-xl sm:p-5 ${editClosing ? 'quick-drawer-panel-out' : ''}`}>
                        <div className="mx-auto max-w-lg">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Edit record</p>
                                    <h2 className="mt-1 text-xl font-semibold">{editingTransaction.type === 'income' ? 'Edit earned money' : 'Edit spent money'}</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeEditDrawer}
                                    className="flex size-10 items-center justify-center rounded-md border border-[#8f633e]/55 bg-[#2a1a12]/70 text-[#d9c4ad] hover:bg-[#4a3022] hover:text-[#fff8ef]"
                                    aria-label="Close edit record"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <TransactionForm accounts={accounts} baseCurrency={baseCurrency} categories={categories} onCreated={handleUpdated} onSavingChange={setEditSaving} transaction={editingTransaction} />
                        </div>
                    </section>
                </div>
            )}

            {pendingDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
                    <section className="w-full max-w-md rounded-lg border border-[#8f633e]/55 bg-[#3a251a] p-5 text-[#f8efe3] shadow-2xl shadow-black/45">
                        <div className="flex items-start gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-red-950/55 text-red-100 ring-1 ring-red-300/35">
                                <Trash2 size={21} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Confirm delete</p>
                                <h2 className="mt-1 text-xl font-semibold">Are you sure?</h2>
                                <p className="mt-2 text-sm leading-6 text-[#d9c4ad]">
                                    This will delete "{pendingDelete.description || pendingDelete.category?.name || 'this money record'}" and update your wallet balance.
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={Boolean(deletingId)}
                                onClick={() => setPendingDelete(null)}
                                className="h-10 w-full rounded-md border border-[#8f633e]/55 bg-[#2a1a12]/60 px-4 text-sm font-bold text-[#d9c4ad] hover:bg-[#4a3022] hover:text-[#fff8ef] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={Boolean(deletingId)}
                                onClick={deleteTransaction}
                                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-red-200 px-4 text-sm font-bold text-red-950 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                {deletingId && <Loader2 size={16} className="animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {(editSaving || deletingId) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm">
                    <section className="flex w-full max-w-xs items-center gap-3 rounded-lg border border-[#8f633e]/55 bg-[#2a1a12] p-4 text-[#f8efe3] shadow-2xl shadow-black/45">
                        <Loader2 size={22} className="animate-spin text-[#f2c38b]" />
                        <div>
                            <p className="font-semibold">{deletingId ? 'Deleting record' : 'Updating record'}</p>
                            <p className="text-sm text-[#d9c4ad]">Please wait...</p>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
