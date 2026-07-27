import { Folder, LayoutDashboard, LogOut, ReceiptText, RefreshCw, WalletCards } from 'lucide-react';
import { money, viewTitle } from '../lib/format.js';
import { MiniNav, NavButton } from './ui.jsx';

export default function AppLayout({
    activeView,
    children,
    loading,
    notice,
    onLogout,
    onRefresh,
    setActiveView,
    summary,
    user,
}) {
    return (
        <div className="min-h-screen app-bg text-[#172033]">
            <aside className="fixed inset-y-0 left-0 hidden w-72 bg-[#14211d] text-white lg:block">
                <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
                    <div className="flex size-11 items-center justify-center rounded-lg bg-[#18b875] text-white shadow-lg shadow-emerald-950/30 ring-1 ring-white/15">
                        <WalletCards size={24} />
                    </div>
                    <div>
                        <p className="text-lg font-semibold">My Money Tracker</p>
                        <p className="text-xs text-slate-400">Daily Spend Tracker</p>
                    </div>
                </div>
                <nav className="space-y-2 p-4">
                    <NavButton icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                    <NavButton icon={ReceiptText} label="Money Records" active={activeView === 'transactions'} onClick={() => setActiveView('transactions')} />
                    <NavButton icon={WalletCards} label="Wallets" active={activeView === 'accounts'} onClick={() => setActiveView('accounts')} />
                    <NavButton icon={Folder} label="Categories" active={activeView === 'categories'} onClick={() => setActiveView('categories')} />
                </nav>
                <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-5">
                    <div className="rounded-lg bg-white/[0.06] p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">This Month</p>
                        <p className="mt-2 text-2xl font-semibold">{money(summary?.monthly_savings)}</p>
                        <p className="mt-1 text-xs text-slate-400">Earned minus spent</p>
                    </div>
                </div>
            </aside>

            <main className="lg:pl-72">
                <header className="sticky top-0 z-20 flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white/88 px-4 py-4 shadow-sm backdrop-blur-xl lg:px-8">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Welcome back, {user?.name || 'friend'}</p>
                        <h1 className="text-2xl font-semibold tracking-normal">{viewTitle(activeView)}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onRefresh} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold shadow-sm hover:bg-[#f7f9fb]">
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                        <button onClick={onLogout} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#14211d] px-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </header>

                <div className="block border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
                    <div className="grid grid-cols-4 gap-2">
                        <MiniNav icon={LayoutDashboard} active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                        <MiniNav icon={ReceiptText} active={activeView === 'transactions'} onClick={() => setActiveView('transactions')} />
                        <MiniNav icon={WalletCards} active={activeView === 'accounts'} onClick={() => setActiveView('accounts')} />
                        <MiniNav icon={Folder} active={activeView === 'categories'} onClick={() => setActiveView('categories')} />
                    </div>
                </div>

                <section className="mx-auto max-w-7xl px-4 py-7 lg:px-8">
                    {notice && <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">{notice}</div>}
                    {loading && <div className="mb-4 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">Loading latest finance data...</div>}
                    {children}
                </section>
            </main>
        </div>
    );
}
