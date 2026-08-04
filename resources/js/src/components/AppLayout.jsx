import { ChartColumnIncreasing, CircleDollarSign, Folder, Grid, LayoutDashboard, Loader2, LogOut, Plus, ReceiptText, RefreshCw, Target, UserCog, WalletCards, X } from 'lucide-react';
import { cloneElement, isValidElement, useState } from 'react';
import { money, viewTitle } from '../lib/format.js';
import TransactionForm from './TransactionForm.jsx';
import { MiniNav, NavButton } from './ui.jsx';
import { toast } from './Toast.jsx';

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
    const [moreSheetOpen, setMoreSheetOpen] = useState(false);
    const [moreSheetClosing, setMoreSheetClosing] = useState(false);

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    async function handleLogoutClick() {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        toast('Signing out safely...', 'info');
        try {
            await onLogout();
        } finally {
            setIsLoggingOut(false);
        }
    }

    function openQuickRecord(type = 'expense') {
        setQuickType(type);
        setQuickClosing(false);
        setQuickOpen(true);
    }

    const navItems = [
        { view: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', mobileLabel: 'Home' },
        { view: 'transactions', icon: ReceiptText, label: 'Money Records', mobileLabel: 'Records' },
        { view: 'budgets', icon: Target, label: 'Budgets', mobileLabel: 'Budgets' },
        { view: 'reports', icon: ChartColumnIncreasing, label: 'Reports', mobileLabel: 'Reports' },
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

    function closeMoreSheet() {
        setMoreSheetClosing(true);
        window.setTimeout(() => {
            setMoreSheetOpen(false);
            setMoreSheetClosing(false);
        }, 260);
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
                        <p className="text-xs font-medium text-[#d9c4ad] sm:text-sm">Welcome back, {user?.name || 'friend'}</p>
                        <h1 className="truncate text-lg font-bold tracking-normal sm:text-2xl">{viewTitle(activeView)}</h1>
                    </div>
                </header>

                <section className="mx-auto max-w-7xl px-3.5 py-4 pb-28 sm:px-6 sm:py-7 lg:px-8 lg:pb-8">
                    {notice && <div className="mb-4 rounded-md border border-[#d7a86e]/45 bg-[#3a251a]/85 px-4 py-3 text-sm text-[#f8efe3] shadow-sm">{notice}</div>}
                    {loading && <div className="mb-4 rounded-md border border-[#8f633e]/45 bg-[#3a251a]/85 px-4 py-3 text-sm text-[#d9c4ad] shadow-sm">Loading latest finance data...</div>}
                    {isValidElement(children) ? cloneElement(children, { openQuickRecord, setActiveView }) : children}
                </section>
            </main>

            {/* Mobile Bottom 5-Slot Nav */}
            <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#8f633e]/35 bg-[#2a1a12]/95 px-2 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl lg:hidden">
                <div className="grid grid-cols-5 items-center gap-1">
                    <MiniNav icon={LayoutDashboard} label="Home" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                    <MiniNav icon={ReceiptText} label="Records" active={activeView === 'transactions'} onClick={() => setActiveView('transactions')} />

                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={() => {
                                setQuickClosing(false);
                                setQuickOpen(true);
                            }}
                            className="flex size-11 items-center justify-center rounded-full border border-[#f2c38b]/60 bg-[#d7a86e] text-[#2a1a12] shadow-lg shadow-black/50 ring-4 ring-[#2a1a12] transition-transform active:scale-95"
                            aria-label="Add money record"
                        >
                            <Plus size={22} strokeWidth={2.8} />
                        </button>
                    </div>

                    <MiniNav icon={Target} label="Budgets" active={activeView === 'budgets'} onClick={() => setActiveView('budgets')} />
                    <MiniNav
                        icon={Grid}
                        label="More"
                        active={['reports', 'accounts', 'categories', 'profile'].includes(activeView)}
                        onClick={() => {
                            setMoreSheetClosing(false);
                            setMoreSheetOpen(true);
                        }}
                    />
                </div>
            </nav>

            {/* Mobile Slide-Up More Menu Sheet */}
            {moreSheetOpen && (
                <div className={`quick-drawer-backdrop fixed inset-0 z-40 flex items-end bg-black/60 backdrop-blur-sm ${moreSheetClosing ? 'quick-drawer-backdrop-out' : ''}`}>
                    <div className="fixed inset-0" onClick={closeMoreSheet} />
                    <section className={`mobile-sheet-panel relative z-10 w-full rounded-t-2xl border-t border-[#8f633e]/55 bg-[#3a251a] p-4 pb-[max(env(safe-area-inset-bottom),1.25rem)] text-[#f8efe3] shadow-2xl ${moreSheetClosing ? 'mobile-sheet-panel-out' : ''}`}>
                        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#8f633e]/60" />
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#f2c38b]">Navigation</p>
                                <h2 className="text-base font-bold">More Features</h2>
                            </div>
                            <button
                                type="button"
                                onClick={closeMoreSheet}
                                className="flex size-8 items-center justify-center rounded-lg border border-[#8f633e]/55 bg-[#2a1a12]/70 text-[#d9c4ad]"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <MoreMenuItem icon={ChartColumnIncreasing} title="Reports" desc="Monthly analytics" active={activeView === 'reports'} onClick={() => { setActiveView('reports'); closeMoreSheet(); }} />
                            <MoreMenuItem icon={WalletCards} title="Wallets" desc="Cash & accounts" active={activeView === 'accounts'} onClick={() => { setActiveView('accounts'); closeMoreSheet(); }} />
                            <MoreMenuItem icon={Folder} title="Categories" desc="Spending tags" active={activeView === 'categories'} onClick={() => { setActiveView('categories'); closeMoreSheet(); }} />
                            <MoreMenuItem icon={UserCog} title="Profile" desc="Settings & info" active={activeView === 'profile'} onClick={() => { setActiveView('profile'); closeMoreSheet(); }} />
                        </div>

                        <div className="mt-3 flex items-center justify-between rounded-xl border border-[#8f633e]/40 bg-[#2a1a12]/70 p-3">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#f2c38b]">This Month Savings</p>
                                <p className="mt-0.5 text-base font-extrabold text-[#fff8ef]">{money(summary?.monthly_savings, baseCurrency)}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { onRefresh(); closeMoreSheet(); }} className="flex size-9 items-center justify-center rounded-lg border border-[#8f633e]/60 bg-[#3a251a] text-[#fff8ef] hover:bg-[#4a3022]">
                                    <RefreshCw size={15} />
                                </button>
                                <button onClick={() => { closeMoreSheet(); handleLogoutClick(); }} className="flex size-9 items-center justify-center rounded-lg bg-[#d7a86e] text-[#2a1a12] font-bold hover:bg-[#e8bb82]">
                                    <LogOut size={15} />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* Desktop Floating Action Button */}
            <div className="fixed bottom-6 right-8 z-30 hidden lg:block">
                <button
                    type="button"
                    onClick={() => {
                        setQuickClosing(false);
                        setQuickOpen(true);
                    }}
                    className="flex h-14 w-24 items-center justify-center rounded-full border border-[#f2c38b]/45 bg-[#d7a86e] text-[#2a1a12] shadow-2xl shadow-black/40 ring-4 ring-[#2a1a12]/55 transition hover:bg-[#e8bb82] hover:shadow-black/55"
                    aria-label="Open quick money record"
                >
                    <CircleDollarSign size={28} strokeWidth={2.4} />
                </button>
            </div>

            {/* Quick Add Record Drawer */}
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

function MoreMenuItem({ icon: Icon, title, desc, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${active ? 'border-[#d7a86e] bg-[#d7a86e]/15 text-[#fff8ef]' : 'border-[#8f633e]/40 bg-[#2a1a12]/60 text-[#d9c4ad] hover:bg-[#2a1a12]'}`}
        >
            <div className={`mb-2 flex size-8 items-center justify-center rounded-lg ${active ? 'bg-[#d7a86e] text-[#2a1a12]' : 'bg-[#3a251a] text-[#f2c38b]'}`}>
                <Icon size={17} />
            </div>
            <p className="text-sm font-bold text-[#fff8ef]">{title}</p>
            <p className="mt-0.5 text-[11px] text-[#b89a7f] leading-tight">{desc}</p>
        </button>
    );
}

