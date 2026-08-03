import { useState } from "react";
import {
    Folder,
    LayoutDashboard,
    LogOut,
    Menu,
    Moon,
    ReceiptText,
    RefreshCw,
    Sun,
    WalletCards,
} from "lucide-react";
import { money } from "../lib/format.js";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toast";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export default function AppLayout({
    activeView,
    children,
    darkMode,
    language,
    loading,
    notice,
    onLogout,
    onRefresh,
    setActiveView,
    setLanguage,
    summary,
    toggleTheme,
    user,
}) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { key: "transactions", label: "Transactions", icon: ReceiptText },
        { key: "accounts", label: "Wallets", icon: WalletCards },
        { key: "categories", label: "Categories", icon: Folder },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col text-foreground">
            {/* ── Top Navigation Bar ── */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    {/* Left: Brand */}
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveView("dashboard")}>
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
                            P
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm leading-tight">Personal Finance</span>
                            <span className="text-[11px] text-muted-foreground leading-tight">Daily Tracker</span>
                        </div>
                    </div>

                    {/* Center: Desktop Nav Items */}
                    <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = activeView === item.key;
                            return (
                                <Button
                                    key={item.key}
                                    variant={active ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setActiveView(item.key)}
                                    className={`h-9 px-3.5 gap-2 font-medium ${active ? "bg-secondary text-secondary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    <Icon className="size-4" />
                                    <span>{item.label}</span>
                                </Button>
                            );
                        })}
                    </nav>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="hidden sm:inline-flex px-3 py-1 text-xs font-semibold">
                            This Month: <span className="ml-1 text-foreground">{money(summary?.monthly_savings)}</span>
                        </Badge>

                        <div className="hidden md:flex items-center gap-1.5">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={toggleTheme}
                                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            >
                                {darkMode ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-slate-600" />}
                                <span className="sr-only">Toggle Theme</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={onRefresh}
                                title="Refresh Data"
                            >
                                <RefreshCw className="size-4" />
                                <span className="sr-only">Refresh</span>
                            </Button>

                            <Separator orientation="vertical" className="h-4 mx-1" />

                            <div className="flex items-center gap-2 pl-1">
                                <span className="text-xs text-muted-foreground hidden lg:inline">
                                    {user?.name || "User"}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onLogout}
                                    className="h-8 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <LogOut className="size-3.5" />
                                    <span>Logout</span>
                                </Button>
                            </div>
                        </div>

                        {/* Mobile Menu Trigger */}
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger
                                render={
                                    <Button variant="outline" size="icon-sm" className="md:hidden">
                                        <Menu className="size-4" />
                                        <span className="sr-only">Toggle Menu</span>
                                    </Button>
                                }
                            />
                            <SheetContent side="right" className="w-80 p-0 flex flex-col">
                                <SheetHeader className="p-4 border-b">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                                            P
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <SheetTitle className="text-sm font-semibold leading-tight">Personal Finance</SheetTitle>
                                            <SheetDescription className="text-xs text-muted-foreground">Daily Tracker</SheetDescription>
                                        </div>
                                    </div>
                                </SheetHeader>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    <div className="space-y-1">
                                        <p className="px-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Navigation</p>
                                        {navItems.map((item) => {
                                            const Icon = item.icon;
                                            const active = activeView === item.key;
                                            return (
                                                <SheetClose key={item.key} render={
                                                    <Button
                                                        variant={active ? "secondary" : "ghost"}
                                                        onClick={() => {
                                                            setActiveView(item.key);
                                                            setMobileOpen(false);
                                                        }}
                                                        className="w-full justify-start h-10 gap-3 px-3 font-medium"
                                                    >
                                                        <Icon className="size-4" />
                                                        <span>{item.label}</span>
                                                    </Button>
                                                } />
                                            );
                                        })}
                                    </div>

                                    <Separator />

                                    <div className="space-y-2 px-2">
                                        <div className="flex items-center justify-between py-1">
                                            <span className="text-xs text-muted-foreground">This Month Savings</span>
                                            <span className="text-sm font-bold">{money(summary?.monthly_savings)}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-1">
                                            <span className="text-xs text-muted-foreground">Logged in as</span>
                                            <span className="text-xs font-medium">{user?.name || "User"}</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-1">
                                        <Button
                                            variant="ghost"
                                            onClick={toggleTheme}
                                            className="w-full justify-start h-10 gap-3 px-3"
                                        >
                                            {darkMode ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-slate-600" />}
                                            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            onClick={onRefresh}
                                            className="w-full justify-start h-10 gap-3 px-3"
                                        >
                                            <RefreshCw className="size-4" />
                                            <span>Refresh Data</span>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            onClick={onLogout}
                                            className="w-full justify-start h-10 gap-3 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <LogOut className="size-4" />
                                            <span>Log out</span>
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            {/* ── Main Content Area ── */}
            <main className="flex-1 mx-auto w-full max-w-7xl p-4 sm:p-6 space-y-6">
                {loading && (
                    <div className="space-y-3">
                        <Skeleton className="h-8 w-48" />
                        <div className="grid gap-4 md:grid-cols-4">
                            <Skeleton className="h-28 rounded-xl" />
                            <Skeleton className="h-28 rounded-xl" />
                            <Skeleton className="h-28 rounded-xl" />
                            <Skeleton className="h-28 rounded-xl" />
                        </div>
                    </div>
                )}

                {notice && (
                    <Alert variant="destructive">
                        <AlertTitle>Notice</AlertTitle>
                        <AlertDescription>{notice}</AlertDescription>
                    </Alert>
                )}

                {children}
            </main>

            <Toaster />
        </div>
    );
}
