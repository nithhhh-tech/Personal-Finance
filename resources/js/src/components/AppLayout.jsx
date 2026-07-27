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
        <div className="min-h-screen app-bg text-[#f8efe3]">
            <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#8f633e]/35 bg-[#2a1a12] text-[#f8efe3] lg:block">
                <div className="flex h-20 items-center gap-3 border-b border-[#8f633e]/35 px-6">
                    <div className="flex size-11 items-center justify-center rounded-lg bg-[#d7a86e] text-[#2a1a12] shadow-lg shadow-black/25 ring-1 ring-[#f2c38b]/25">
                        <WalletCards size={24} />
                    </div>
                    <div>
                        <p className="text-lg font-semibold">My Money Tracker</p>
                        <p className="text-xs text-[#d9c4ad]">Daily Spend Tracker</p>
                    </div>
                </div>
                <nav className="space-y-2 p-4">
                    <NavButton icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                    <NavButton icon={ReceiptText} label="Money Records" active={activeView === 'transactions'} onClick={() => setActiveView('transactions')} />
                    <NavButton icon={WalletCards} label="Wallets" active={activeView === 'accounts'} onClick={() => setActiveView('accounts')} />
                    <NavButton icon={Folder} label="Categories" active={activeView === 'categories'} onClick={() => setActiveView('categories')} />
                </nav>
                <div className="absolute bottom-0 left-0 right-0 border-t border-[#8f633e]/35 p-5">
                    <div className="rounded-lg border border-[#8f633e]/40 bg-[#3a251a] p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#f2c38b]">This Month</p>
                        <p className="mt-2 text-2xl font-semibold">{money(summary?.monthly_savings)}</p>
                        <p className="mt-1 text-xs text-[#d9c4ad]">Earned minus spent</p>
                    </div>
                </div>
            </aside>

            <main className="lg:pl-72">
                <header className="sticky top-0 z-20 flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-[#8f633e]/30 bg-[#3a251a]/88 px-4 py-4 shadow-sm shadow-black/20 backdrop-blur-xl lg:px-8">
                    <div>
                        <p className="text-sm font-medium text-[#d9c4ad]">Welcome back, {user?.name || 'friend'}</p>
                        <h1 className="text-2xl font-semibold tracking-normal">{viewTitle(activeView)}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onRefresh} className="inline-flex h-10 items-center gap-2 rounded-md border border-[#8f633e]/60 bg-[#2a1a12]/50 px-3 text-sm font-semibold text-[#fff8ef] shadow-sm hover:bg-[#4a3022]">
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                        <button onClick={onLogout} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#d7a86e] px-3 text-sm font-bold text-[#2a1a12] shadow-sm hover:bg-[#e8bb82]">
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </header>

                <div className="block border-b border-[#8f633e]/30 bg-[#3a251a]/88 px-4 py-3 lg:hidden">
                    <div className="grid grid-cols-4 gap-2">
                        <MiniNav icon={LayoutDashboard} active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                        <MiniNav icon={ReceiptText} active={activeView === 'transactions'} onClick={() => setActiveView('transactions')} />
                        <MiniNav icon={WalletCards} active={activeView === 'accounts'} onClick={() => setActiveView('accounts')} />
                        <MiniNav icon={Folder} active={activeView === 'categories'} onClick={() => setActiveView('categories')} />
                    </div>
                </div>

                <section className="mx-auto max-w-7xl px-4 py-7 lg:px-8">
                    {notice && <div className="mb-4 rounded-md border border-[#d7a86e]/45 bg-[#3a251a]/85 px-4 py-3 text-sm text-[#f8efe3] shadow-sm">{notice}</div>}
                    {loading && <div className="mb-4 rounded-md border border-[#8f633e]/45 bg-[#3a251a]/85 px-4 py-3 text-sm text-[#d9c4ad] shadow-sm">Loading latest finance data...</div>}
                    {children}
                </section>
            </main>
        </div>
    );
}
