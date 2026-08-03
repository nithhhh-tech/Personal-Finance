import { cn } from '@/lib/utils';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Empty as ShadcnEmpty, EmptyContent, EmptyDescription } from './ui/empty.jsx';

export function Panel({ title, description, action, children, className }) {
    return (
        <Card className={className}>
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

export function TxRow({ title, meta, value, tone = '' }) {
    const isIncome = tone.includes('emerald');
    const isExpense = tone.includes('rose');

    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-card px-3.5 py-3 transition-colors hover:bg-muted/50">
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{title}</p>
                {meta && <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</p>}
            </div>
            <p className={cn(
                "shrink-0 text-sm font-semibold tabular-nums",
                isIncome && "text-emerald-600 dark:text-emerald-400",
                isExpense && "text-rose-600 dark:text-rose-400"
            )}>
                {value}
            </p>
        </div>
    );
}

export function StatCard({ title, value, hint, icon: Icon, tone }) {
    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {Icon && <Icon className="size-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
            </CardContent>
        </Card>
    );
}

export function PageHeader({ title, description, action }) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
            {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
    );
}
