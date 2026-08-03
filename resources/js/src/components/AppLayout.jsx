import { useState } from "react";
import {
    BarChart3,
    Folder,
    LayoutDashboard,
    LogOut,
    Menu,
    Moon,
    ReceiptText,
    RefreshCw,
    Sun,
    Target,
    Wallet,
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
    loading,
    notice,
    onLogout,
    onRefresh,
    setActiveView,
    summary,
    toggleTheme,
    user,
}) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { key: "transactions", label: "Transactions", icon: ReceiptText },
        { key: "accounts", label: "Wallets", icon: Wallet },
        { key: "categories", label: "Categories", icon: Folder },
        { key: "budgets", label: "Budgets", icon: Target },
        { key: "reports", label: "Reports", icon: BarChart3 },
    ];

    const initials = (user?.name || "U").trim().charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-background flex flex-col text-foreground">
            {/* ── Top Navigation Bar ── */}
            <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
                <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
                    {/* Left: Brand */}
                    <div
                        className="flex items-center gap-2.5 cursor-pointer select-none"
                        onClick={() => setActiveView("dashboard")}
                    >
                        <div className="flex size-9 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-sm">
                            <Wallet className="size-4.5" />
                        </div>
                        <div className="hidden sm:flex flex-col leading-tight">
                            <span className="font-semibold text-sm tracking-tight">Personal Finance</span>
                            <span className="text-[11px] text-muted-foreground leading-tight">Daily Tracker</span>
                        </div>
                    </div>

                    {/* Center: Desktop Segmented Nav */}
                    <nav className="hidden lg:flex items-center gap-1 rounded-full bg-secondary/70 p-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = activeView === item.key;
                            return (
                                <Button
                                    key={item.key}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveView(item.key)}
                                    className={`h-8 gap-1.5 rounded-full px-3.5 text-[0.8rem] font-medium ${
                                        active
                                            ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <Icon className="size-3.5" />
                                    <span>{item.label}</span>
                                </Button>
                            );
                        })}
                    </nav>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5">
                        <Badge
                            variant="secondary"
                            className="hidden xl:inline-flex h-7 rounded-full gap-1 px-3 py-1 text-xs font-medium"
                        >
                            <span className="text-muted-foreground">This month</span>
                            <span className="font-semibold text-foreground tabular-nums">
                                {money(summary?.monthly_savings)}
                            </span>
                        </Badge>

                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={toggleTheme}
                            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            className="rounded-full"
                        >
                            {darkMode ? (
                                <Sun className="size-4 text-amber-400" />
                            ) : (
                                <Moon className="size-4 text-amber-700" />
                            )}
                            <span className="sr-only">Toggle Theme</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={onRefresh}
                            title="Refresh Data"
                            className="rounded-full"
                        >
                            <RefreshCw className="size-4" />
                            <span className="sr-only">Refresh</span>
                        </Button>

                        <Separator orientation="vertical" className="hidden sm:block h-5 mx-1" />

                        <div className="hidden md:flex items-center gap-2 pl-1">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {initials}
                            </span>
                            <span className="hidden xl:inline text-xs font-medium text-muted-foreground">
                                {user?.name || "User"}
                            </span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={onLogout}
                            title="Logout"
                            className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                            <LogOut className="size-4" />
                            <span className="sr-only">Logout</span>
                        </Button>

                        {/* Mobile Menu Trigger */}
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger
                                render={
                                    <Button
                                        variant="outline"
                                        size="icon-sm"
                                        className="rounded-full lg:hidden"
                                    >
                                        <Menu className="size-4" />
                                        <span className="sr-only">Toggle Menu</span>
                                    </Button>
                                }
                            />
                            <SheetContent side="right" className="w-80 p-0 flex flex-col">
                                <SheetHeader className="p-4 border-b">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex size-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
                                            <Wallet className="size-4" />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <SheetTitle className="text-sm font-semibold leading-tight">
                                                Personal Finance
                                            </SheetTitle>
                                            <SheetDescription className="text-xs text-muted-foreground">
                                                Daily Tracker
                                            </SheetDescription>
                                        </div>
                                    </div>
                                </SheetHeader>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    <div className="space-y-1">
                                        <p className="px-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
                                            Navigation
                                        </p>
                                        {navItems.map((item) => {
                                            const Icon = item.icon;
                                            const active = activeView === item.key;
                                            return (
                                                <SheetClose
                                                    key={item.key}
                                                    render={
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
                                                    }
                                                />
                                            );
                                        })}
                                    </div>

                                    <Separator />

                                    <div className="space-y-2 px-2">
                                        <div className="flex items-center justify-between py-1">
                                            <span className="text-xs text-muted-foreground">
                                                This Month Savings
                                            </span>
                                            <span className="text-sm font-bold tabular-nums">
                                                {money(summary?.monthly_savings)}
                                            </span>
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
                                            {darkMode ? (
                                                <Sun className="size-4 text-amber-400" />
                                            ) : (
                                                <Moon className="size-4 text-amber-700" />
                                            )}
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
                        <Skeleton className="h-8 w-48 rounded-full" />
                        <div className="grid gap-4 md:grid-cols-4">
                            <Skeleton className="h-28 rounded-2xl" />
                            <Skeleton className="h-28 rounded-2xl" />
                            <Skeleton className="h-28 rounded-2xl" />
                            <Skeleton className="h-28 rounded-2xl" />
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
