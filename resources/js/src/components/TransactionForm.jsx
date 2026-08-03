import { useEffect, useState } from 'react';
import { Plus, RefreshCw, RotateCcw, Zap } from 'lucide-react';
import { api } from '../lib/api.js';
import { readError, today } from '../lib/format.js';
import { CURRENCY_OPTIONS, DEFAULT_FALLBACK_RATES } from '../lib/currencies.js';
import { toast } from './Toast.jsx';
import { Empty, Input, Select } from './ui.jsx';

function formatLastUpdated(isoString) {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
        return isoString;
    }
}

function blankForm(type = 'expense') {
    return {
        type,
        account_id: '',
        category_id: '',
        amount: '',
        currency: 'USD',
        exchange_rate: 1,
        transaction_date: today,
        payment_method: '',
        description: '',
    };
}

function formFromTransaction(transaction, fallbackType) {
    if (!transaction) return blankForm(fallbackType);

    const currency = transaction.currency || 'USD';
    const fallbackRate = DEFAULT_FALLBACK_RATES[currency] || 1;

    return {
        type: transaction.type || fallbackType,
        account_id: transaction.account_id || '',
        category_id: transaction.category_id || '',
        amount: transaction.amount || '',
        currency,
        exchange_rate: Number(transaction.exchange_rate || fallbackRate),
        transaction_date: String(transaction.transaction_date || today).slice(0, 10),
        payment_method: transaction.payment_method || '',
        description: transaction.description || '',
    };
}

export default function TransactionForm({ accounts, baseCurrency = 'USD', categories, hideType = false, initialType = 'expense', onCreated, onSavingChange = null, transaction = null }) {
    const [form, setForm] = useState(() => formFromTransaction(transaction, initialType));
    const [error, setError] = useState('');
    const [rateInfo, setRateInfo] = useState(null);
    const [loadingRate, setLoadingRate] = useState(false);
    const [isCustomRate, setIsCustomRate] = useState(false);

    const editing = Boolean(transaction);
    const availableCategories = categories.filter((category) => category.type === form.type);
    const needsExchangeRate = form.currency !== baseCurrency;

    const fetchLiveRate = async (forceRefresh = false, targetCurrency = form.currency) => {
        if (targetCurrency === baseCurrency) return;
        setLoadingRate(true);
        try {
            const res = await api.get('/exchange-rate', {
                params: { currency: targetCurrency, refresh: forceRefresh ? 1 : 0 },
            });
            setRateInfo(res.data);
            if (!editing && (!isCustomRate || forceRefresh)) {
                setForm((current) => ({ ...current, exchange_rate: res.data.rate }));
                setIsCustomRate(false);
            }
        } catch (err) {
            console.error('Failed to fetch exchange rate:', err);
        } finally {
            setLoadingRate(false);
        }
    };

    useEffect(() => {
        if (needsExchangeRate) {
            fetchLiveRate(false, form.currency);
        }
    }, [form.currency, needsExchangeRate]);

    useEffect(() => {
        if (!editing && !form.account_id && accounts[0]) setForm((current) => ({ ...current, account_id: accounts[0].id }));
    }, [accounts, editing, form.account_id]);

    useEffect(() => {
        const first = availableCategories[0];
        if (first && !availableCategories.some((category) => String(category.id) === String(form.category_id))) {
            setForm((current) => ({ ...current, category_id: first.id }));
        }
    }, [form.type, categories]);

    useEffect(() => {
        if (!editing) setForm((current) => ({ ...current, type: initialType, category_id: '' }));
    }, [initialType, editing]);

    useEffect(() => {
        if (editing) setForm(formFromTransaction(transaction, initialType));
        setError('');
    }, [transaction, initialType, editing]);

    const handleCurrencyChange = (newCurrency) => {
        const defaultRate = newCurrency === baseCurrency ? 1 : (DEFAULT_FALLBACK_RATES[newCurrency] || 1);
        setForm((current) => ({
            ...current,
            currency: newCurrency,
            exchange_rate: defaultRate,
        }));
        setIsCustomRate(false);
        setRateInfo(null);
    };

    const handleRateChange = (val) => {
        setForm((current) => ({ ...current, exchange_rate: val }));
        if (rateInfo && Number(val) !== Number(rateInfo.rate)) {
            setIsCustomRate(true);
        } else {
            setIsCustomRate(false);
        }
    };

    const handleResetRate = () => {
        if (rateInfo?.rate) {
            setForm((current) => ({ ...current, exchange_rate: rateInfo.rate }));
            setIsCustomRate(false);
        } else {
            fetchLiveRate(true, form.currency);
        }
    };

    async function submit(event) {
        event.preventDefault();
        setError('');
        onSavingChange?.(true);

        try {
            if (editing) {
                await api.put(`/transactions/${transaction.id}`, form);
                toast('Money record updated!', 'success');
            } else {
                await api.post('/transactions', form);
                toast('Money record saved!', 'success');
                setForm({ ...form, amount: '', description: '', transaction_date: today });
            }
            onCreated();
        } catch (err) {
            const msg = readError(err);
            setError(msg);
            toast(msg, 'error');
        } finally {
            onSavingChange?.(false);
        }
    }

    const quickAmounts = form.currency === 'KHR'
        ? [1000, 5000, 10000, 50000]
        : form.currency === 'VND'
        ? [10000, 50000, 100000, 500000]
        : [5, 10, 20, 50];

    return (
        <form onSubmit={submit} className="space-y-4">
            {accounts.length === 0 && <Empty text="Add a wallet before recording money." />}
            <div className="grid gap-4 sm:grid-cols-2">
                {!hideType && <Select label="Type" value={form.type} onChange={(type) => setForm({ ...form, type, category_id: '' })} options={[['expense', 'Spent'], ['income', 'Earned']]} />}
                <div>
                    <Input label="Amount earned/spent" type="number" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {quickAmounts.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => setForm((current) => ({ ...current, amount: String(Number(current.amount || 0) + preset) }))}
                                className="inline-flex items-center gap-0.5 rounded-md border border-[#8f633e]/55 bg-[#2a1a12]/60 px-2 py-0.5 text-xs font-semibold text-[#f2c38b] hover:bg-[#4a3022] hover:text-[#fff8ef] transition"
                            >
                                <Zap size={10} />
                                +{preset.toLocaleString()}
                            </button>
                        ))}
                    </div>
                </div>
                <Select label="Currency" value={form.currency} onChange={handleCurrencyChange} options={CURRENCY_OPTIONS} />
                <Select label="Wallet" value={form.account_id} onChange={(account_id) => setForm({ ...form, account_id })} options={accounts.map((account) => [account.id, account.name])} />
                <Select label="Category" value={form.category_id} onChange={(category_id) => setForm({ ...form, category_id })} options={availableCategories.map((category) => [category.id, category.name])} />
                {needsExchangeRate && (
                    <div className="block text-sm font-semibold text-[#d9c4ad]">
                        <div className="flex items-center justify-between">
                            <span>1 {baseCurrency} =</span>
                            {rateInfo && (
                                <button
                                    type="button"
                                    onClick={() => fetchLiveRate(true, form.currency)}
                                    disabled={loadingRate}
                                    className="inline-flex items-center gap-1 text-xs text-[#d7a86e] hover:underline disabled:opacity-50"
                                    title="Refresh exchange rate"
                                >
                                    <RefreshCw size={12} className={loadingRate ? 'animate-spin' : ''} />
                                    {loadingRate ? 'Fetching...' : 'Refresh'}
                                </button>
                            )}
                        </div>
                        <div className="mt-1 flex h-11 items-center rounded-md border border-[#8f633e]/60 bg-[#2a1a12]/70 focus-within:border-[#d7a86e] focus-within:ring-4 focus-within:ring-[#d7a86e]/15">
                            <input
                                type="number"
                                step="any"
                                min="0.000001"
                                value={form.exchange_rate}
                                onChange={(event) => handleRateChange(event.target.value)}
                                className="h-full min-w-0 flex-1 bg-transparent px-3 text-[#fff8ef] outline-none"
                            />
                            <span className="shrink-0 px-3 text-sm font-bold text-[#f2c38b]">{form.currency}</span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-xs font-medium text-[#b89a7f]">
                            {rateInfo ? (
                                <div className="flex items-center gap-1.5">
                                    <span className={`inline-block h-2 w-2 rounded-full ${rateInfo.is_fallback ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                    <span>
                                        {rateInfo.is_fallback ? 'Fallback rate' : 'Auto rate'} • Last updated: {formatLastUpdated(rateInfo.last_updated_at)}
                                    </span>
                                </div>
                            ) : (
                                <span>Auto-fetching live rate...</span>
                            )}
                            {(isCustomRate || (rateInfo && Number(form.exchange_rate) !== Number(rateInfo.rate))) && (
                                <button
                                    type="button"
                                    onClick={handleResetRate}
                                    className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 underline"
                                >
                                    <RotateCcw size={11} />
                                    Reset to live ({rateInfo?.rate || DEFAULT_FALLBACK_RATES[form.currency] || 1})
                                </button>
                            )}
                        </div>
                    </div>
                )}
                <Input label="Date" type="date" value={form.transaction_date} onChange={(transaction_date) => setForm({ ...form, transaction_date })} />
                <Input label="Payment method" value={form.payment_method} onChange={(payment_method) => setForm({ ...form, payment_method })} />
            </div>
            <label className="block text-sm font-semibold text-[#d9c4ad]">
                Note
                <textarea
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    className="mt-1 min-h-24 w-full rounded-md border border-[#8f633e]/60 bg-[#2a1a12]/70 px-3 py-2 text-[#fff8ef] outline-none transition focus:border-[#d7a86e] focus:ring-4 focus:ring-[#d7a86e]/15"
                />
            </label>
            {error && <p className="rounded-md border border-red-300/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">{error}</p>}
            <button disabled={accounts.length === 0} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#d7a86e] px-4 font-bold text-[#2a1a12] shadow-lg shadow-black/20 hover:bg-[#e8bb82] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                <Plus size={18} />
                {editing ? 'Update money record' : 'Save money record'}
            </button>
        </form>
    );
}
