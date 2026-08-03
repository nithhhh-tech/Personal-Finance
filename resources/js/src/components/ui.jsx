import { cn } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Empty as ShadcnEmpty, EmptyContent, EmptyDescription } from './ui/empty.jsx';

export function Panel({ title, description, action, children, className }) {
    return (
        <Card className={cn('rounded-sm', className)}>
            {(title || action || description) && (
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                    {action && <CardAction>{action}</CardAction>}
                </CardHeader>
            )}
            <CardContent>{children}</CardContent>
        </Card>
    );
}

export function Empty({ text, className }) {
    return (
        <ShadcnEmpty className={className}>
            <EmptyContent>
                <EmptyDescription>{text}</EmptyDescription>
            </EmptyContent>
        </ShadcnEmpty>
    );
}

export function TxRow({ title, meta, value, tone = '', className }) {
    const isIncome = tone.includes('emerald');
    const isExpense = tone.includes('rose');
    const Icon = isIncome ? ArrowDownLeft : isExpense ? ArrowUpRight : Wallet;

    return (
        <div className={cn('flex items-center justify-between gap-3 rounded-sm bg-card px-3.5 py-3 ring-1 ring-foreground/5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent/40 hover:shadow-sm', className)}>
            <div className="flex min-w-0 items-center gap-3">
                <span
                    className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-full',
                        isIncome
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : isExpense
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'bg-primary/10 text-primary'
                    )}
                >
                    <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{title}</p>
                    {meta && <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</p>}
                </div>
            </div>
            <p
                className={cn(
                    'shrink-0 text-sm font-semibold tabular-nums',
                    isIncome && 'text-emerald-600 dark:text-emerald-400',
                    isExpense && 'text-rose-600 dark:text-rose-400'
                )}
            >
                {value}
            </p>
        </div>
    );
}

const statTones = {
    default: 'bg-muted text-muted-foreground',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
};

export function StatCard({ title, value, hint, icon: Icon, tone = 'default', className }) {
    return (
        <Card className={cn('rounded-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md', className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {Icon && (
                    <span
                        className={cn(
                            'flex size-8 items-center justify-center rounded-xl',
                            statTones[tone] || statTones.default
                        )}
                    >
                        <Icon className="size-4" />
                    </span>
                )}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
                {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
            </CardContent>
        </Card>
    );
}

export function PageHeader({ title, description, action }) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
                {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
            {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
    );
}
