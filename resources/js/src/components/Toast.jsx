import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

const icons = {
    success: CheckCircle2,
    info: Info,
    warning: AlertTriangle,
    error: XCircle,
};

const colors = {
    success: 'border-emerald-400/40 bg-emerald-950/85 text-emerald-100',
    info: 'border-[#d7a86e]/40 bg-[#3a251a]/95 text-[#f8efe3]',
    warning: 'border-amber-400/40 bg-amber-950/85 text-amber-100',
    error: 'border-red-400/40 bg-red-950/85 text-red-100',
};

const iconColors = {
    success: 'text-emerald-400',
    info: 'text-[#f2c38b]',
    warning: 'text-amber-400',
    error: 'text-red-400',
};

let _addToast = null;

export function toast(message, type = 'success') {
    _addToast?.({ id: Date.now() + Math.random(), message, type });
}

export function ToastContainer() {
    const [toasts, setToasts] = useState([]);
    const [exiting, setExiting] = useState(new Set());

    useEffect(() => {
        _addToast = (toast) => {
            setToasts((current) => [...current, toast]);
            setTimeout(() => dismiss(toast.id), 3500);
        };
        return () => { _addToast = null; };
    }, []);

    function dismiss(id) {
        setExiting((ex) => new Set([...ex, id]));
        setTimeout(() => {
            setToasts((current) => current.filter((t) => t.id !== id));
            setExiting((ex) => { const next = new Set(ex); next.delete(id); return next; });
        }, 300);
    }

    if (!toasts.length) return null;

    return (
        <div className="fixed bottom-28 right-4 z-[100] flex flex-col gap-2 lg:bottom-8 lg:right-6" aria-live="polite">
            {toasts.map((t) => {
                const Icon = icons[t.type] || icons.success;
                const leaving = exiting.has(t.id);
                return (
                    <div
                        key={t.id}
                        className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-300 ${colors[t.type]} ${leaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
                        style={{ maxWidth: 340 }}
                    >
                        <Icon size={17} className={`mt-0.5 shrink-0 ${iconColors[t.type]}`} />
                        <span className="flex-1 leading-snug">{t.message}</span>
                        <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
                            <X size={15} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
