import { ChartColumnIncreasing, CircleDollarSign, Folder, LayoutDashboard, LogOut, ReceiptText, RefreshCw, Settings, Target, UserCog, WalletCards, X } from 'lucide-react';
import { useState } from 'react';
import { money, viewTitle } from '../lib/format.js';
import TransactionForm from './TransactionForm.jsx';
import { MiniNav, NavButton } from './ui.jsx';

export default function AppLayout({
    accounts,
    activeView,
    baseCurrency,
    categories,
    children,
    loading,
    notice,
    onQuickCreated,
    onLogout,
    onRefresh,
    setActiveView,
    summary,
    user,
}) {
    const [quickOpen, setQuickOpen] = useState(false);
    const [quickClosing, setQuickClosing] = useState(false);
    const [quickType, setQuickType] = useState('expense');
    const navItems = [
        { view: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', mobileLabel: 'Home' },
        { view: 'transactions', icon: ReceiptText, label: 'Money Records', mobileLabel: 'Records' },
        { view: 'budgets', icon: Target, label: 'Budgets', mobileLabel: 'Budget' },
        { view: 'reports', icon: ChartColumnIncreasing, label: 'Reports', mobileLabel: 'Report' },
        { view: 'accounts', icon: WalletCards, label: 'Wallets', mobileLabel: 'Wallets' },
        { view: 'categories', icon: Folder, label: 'Categories', mobileLabel: 'Groups' },
        { view: 'profile', icon: UserCog, label: 'Profile & Settings', mobileLabel: 'Profile' },
    ];

    function closeQuickAdd() {
        setQuickClosing(true);
        window.setTimeout(() => {
            setQuickOpen(false);
            setQuickClosing(false);
        }, 320);
    }

    function handleQuickCreated() {
        onQuickCreated();
        closeQuickAdd();
    }

    return (
        <div className="min-h-screen app-bg text-[#f8efe3]">
            <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#8f633e]/35 bg-[#2a1a12] text-[#f8efe3] lg:block">
                <div className="flex h-20 items-center border-b border-[#8f633e]/35 px-6">
                    <div>
                        <span className="block text-xl font-black leading-6 text-[#fff8ef]">
                            Pocket<span className="text-[#d7a86e]">Ledger</span>
                        </span>
                        <span className="block text-xs font-medium leading-4 text-[#d9c4ad]">Personal finance</span>
                    </div>
                </div>
                <nav className="space-y-2 p-4">
                    {navItems.map((item) => (
                        <NavButton key={item.view} icon={item.icon} label={item.label} active={activeView === item.view} onClick={() => setActiveView(item.view)} />
                    ))}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 border-t border-[#8f633e]/35 p-5">
                    <div className="rounded-lg border border-[#8f633e]/40 bg-[#3a251a] p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#f2c38b]">This Month</p>
                        <p className="mt-2 text-2xl font-semibold">{money(summary?.monthly_savings, baseCurrency)}</p>
                        <p className="mt-1 text-xs text-[#d9c4ad]">Earned minus spent</p>
                    </div>
                </div>
            </aside>

            <main className="lg:pl-72">
                <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-[#8f633e]/30 bg-[#3a251a]/92 px-4 py-3 shadow-sm shadow-black/20 backdrop-blur-xl lg:min-h-20 lg:px-8 lg:py-4">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-[#d9c4ad]">Welcome back, {user?.name || 'friend'}</p>
                        <h1 className="truncate text-xl font-semibold tracking-normal sm:text-2xl">{viewTitle(activeView)}</h1>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <button onClick={onRefresh} className="inline-flex h-10 items-center gap-2 rounded-md border border-[#8f633e]/60 bg-[#2a1a12]/50 px-3 text-sm font-semibold text-[#fff8ef] shadow-sm hover:bg-[#4a3022]">
                            <RefreshCw size={16} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button onClick={onLogout} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#d7a86e] px-3 text-sm font-bold text-[#2a1a12] shadow-sm hover:bg-[#e8bb82]">
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </header>

                <section className="mx-auto max-w-7xl px-4 py-5 pb-32 sm:py-7 lg:px-8 lg:pb-7">
                    {notice && <div className="mb-4 rounded-md border border-[#d7a86e]/45 bg-[#3a251a]/85 px-4 py-3 text-sm text-[#f8efe3] shadow-sm">{notice}</div>}
                    {loading && <div className="mb-4 rounded-md border border-[#8f633e]/45 bg-[#3a251a]/85 px-4 py-3 text-sm text-[#d9c4ad] shadow-sm">Loading latest finance data...</div>}
                    {children}
                </section>
            </main>

            <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#8f633e]/35 bg-[#2a1a12]/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-2xl shadow-black/40 backdrop-blur-xl lg:hidden">
                <div className="grid grid-cols-6 gap-1">
                    {navItems.map((item) => (
                        <MiniNav key={item.view} icon={item.icon} label={item.mobileLabel} active={activeView === item.view} onClick={() => setActiveView(item.view)} />
                    ))}
                </div>
            </nav>

            <div className="fixed bottom-24 right-4 z-30 lg:bottom-5 lg:right-8">
                <button
                    type="button"
                    onClick={() => {
                        setQuickClosing(false);
                        setQuickOpen(true);
                    }}
                    className="flex h-[52px] w-20 items-center justify-center rounded-full border border-[#f2c38b]/45 bg-[#d7a86e] text-[#2a1a12] shadow-2xl shadow-black/40 ring-4 ring-[#2a1a12]/55 transition hover:bg-[#e8bb82] hover:shadow-black/55 sm:h-14 sm:w-24"
                    aria-label="Open quick money record"
                >
                    <CircleDollarSign size={28} strokeWidth={2.4} />
                </button>
            </div>

            {quickOpen && (
                <div className={`quick-drawer-backdrop fixed inset-0 z-40 flex justify-end bg-black/45 backdrop-blur-sm ${quickClosing ? 'quick-drawer-backdrop-out' : ''}`}>
                    <section className={`quick-drawer-panel h-full w-full overflow-y-auto border-l border-[#8f633e]/55 bg-[#3a251a] p-4 text-[#f8efe3] shadow-2xl shadow-black/45 sm:max-w-xl sm:p-5 ${quickClosing ? 'quick-drawer-panel-out' : ''}`}>
                        <div className="mx-auto max-w-lg">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2c38b]">Quick record</p>
                                    <h2 className="mt-1 text-xl font-semibold">{quickType === 'income' ? 'Add quick earn' : 'Add quick spend'}</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeQuickAdd}
                                    className="flex size-10 items-center justify-center rounded-md border border-[#8f633e]/55 bg-[#2a1a12]/70 text-[#d9c4ad] hover:bg-[#4a3022] hover:text-[#fff8ef]"
                                    aria-label="Close quick record"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="mb-4 grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setQuickType('expense')}
                                    className={`h-10 rounded-md text-sm font-bold ${quickType === 'expense' ? 'bg-[#f0a36f] text-[#2a1a12]' : 'border border-[#8f633e]/55 bg-[#2a1a12]/60 text-[#d9c4ad]'}`}
                                >
                                    Spend
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setQuickType('income')}
                                    className={`h-10 rounded-md text-sm font-bold ${quickType === 'income' ? 'bg-[#89e6ba] text-[#14211d]' : 'border border-[#8f633e]/55 bg-[#2a1a12]/60 text-[#d9c4ad]'}`}
                                >
                                    Earn
                                </button>
                            </div>
                            <TransactionForm accounts={accounts} baseCurrency={baseCurrency} categories={categories} hideType initialType={quickType} onCreated={handleQuickCreated} />
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
