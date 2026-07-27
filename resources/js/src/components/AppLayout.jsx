import {
    Coffee,
    Folder,
    LayoutDashboard,
    LogOut,
    Moon,
    ReceiptText,
    RefreshCw,
    Sun,
    WalletCards,
} from "lucide-react";
import { money, viewTitle } from "../lib/format.js";
import { MiniNav } from "./ui.jsx";

export default function AppLayout({
    activeView,
    children,
    darkMode,
    loading,
    notice,
    onLogout,
    onRefresh,
    setActiveView,
    summary,
    toggleTheme,
    user,
}) {
    return (
        <div style={{ minHeight: "100vh", background: "var(--apple-bg)" }}>
            {/* ── Apple Top Navbar ── */}
            <header className="navbar apple-glass-header">
                <div className="navbar-container">
                    {/* Brand */}
                    <div className="navbar-brand">
                        <div className="brand-icon">
                            <Coffee size={22} strokeWidth={2.2} />
                        </div>
                        <div>
                            <p className="brand-name font-khmer">
                                My Money Tracker
                            </p>
                            <p className="brand-sub">Daily Spend Tracker</p>
                        </div>
                    </div>
                    {/* Nav Items (Desktop) */}
                    <nav className="navbar-nav desktop-only">
                        <button
                            onClick={() => setActiveView("dashboard")}
                            className={`navbar-nav-btn${activeView === "dashboard" ? " active" : ""}`}
                        >
                            <LayoutDashboard
                                size={17}
                                strokeWidth={
                                    activeView === "dashboard" ? 2.2 : 1.8
                                }
                            />
                            <span>Dashboard</span>
                        </button>
                        <button
                            onClick={() => setActiveView("transactions")}
                            className={`navbar-nav-btn${activeView === "transactions" ? " active" : ""}`}
                        >
                            <ReceiptText
                                size={17}
                                strokeWidth={
                                    activeView === "transactions" ? 2.2 : 1.8
                                }
                            />
                            <span>Records</span>
                        </button>
                        <button
                            onClick={() => setActiveView("accounts")}
                            className={`navbar-nav-btn${activeView === "accounts" ? " active" : ""}`}
                        >
                            <WalletCards
                                size={17}
                                strokeWidth={
                                    activeView === "accounts" ? 2.2 : 1.8
                                }
                            />
                            <span>Wallets</span>
                        </button>
                        <button
                            onClick={() => setActiveView("categories")}
                            className={`navbar-nav-btn${activeView === "categories" ? " active" : ""}`}
                        >
                            <Folder
                                size={17}
                                strokeWidth={
                                    activeView === "categories" ? 2.2 : 1.8
                                }
                            />
                            <span>Categories</span>
                        </button>
                    </nav>

                    {/* Actions & Summary */}
                    <div className="navbar-actions">
                        <div className="navbar-month-badge desktop-only">
                            <span className="navbar-month-label">
                                This Month:
                            </span>
                            <span className="navbar-month-value">
                                {money(summary?.monthly_savings)}
                            </span>
                        </div>

                        {/* Dark / Light Mode Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="theme-toggle-btn"
                            title={
                                darkMode
                                    ? "Switch to Light Mode"
                                    : "Switch to Dark Mode"
                            }
                            id="theme-toggle-btn"
                        >
                            {darkMode ? (
                                <Sun size={17} className="text-amber-400" />
                            ) : (
                                <Moon size={17} className="text-slate-600" />
                            )}
                            <span className="btn-label-desktop">
                                {darkMode ? "Light" : "Dark"}
                            </span>
                        </button>

                        <button
                            onClick={onRefresh}
                            className="btn-outline"
                            id="refresh-btn"
                        >
                            <RefreshCw size={15} />
                            <span className="btn-label-desktop">Refresh</span>
                        </button>
                        <button
                            onClick={onLogout}
                            className="btn-dark"
                            id="logout-btn"
                        >
                            <LogOut size={15} />
                            <span className="btn-label-desktop">Log out</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Nav Bar */}
            <div className="mobile-nav">
                <div className="mobile-nav-grid">
                    <MiniNav
                        icon={LayoutDashboard}
                        active={activeView === "dashboard"}
                        onClick={() => setActiveView("dashboard")}
                    />
                    <MiniNav
                        icon={ReceiptText}
                        active={activeView === "transactions"}
                        onClick={() => setActiveView("transactions")}
                    />
                    <MiniNav
                        icon={WalletCards}
                        active={activeView === "accounts"}
                        onClick={() => setActiveView("accounts")}
                    />
                    <MiniNav
                        icon={Folder}
                        active={activeView === "categories"}
                        onClick={() => setActiveView("categories")}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <main className="main-content">
                <div className="page-header-bar">
                    <div>
                        <p className="top-header-greeting">
                            Welcome back, {user?.name || "friend"}
                        </p>
                        <h1 className="top-header-title">
                            {viewTitle(activeView)}
                        </h1>
                    </div>
                </div>

                <section className="page-section">
                    {loading && <div className="loading-indicator" />}
                    {notice && <div className="notice-bar warn">{notice}</div>}
                    {children}
                </section>
            </main>
        </div>
    );
}
