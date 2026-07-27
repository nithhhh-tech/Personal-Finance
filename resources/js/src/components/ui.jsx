export function Panel({ title, children }) {
    return (
        <section className="rounded-lg border border-white bg-white/94 p-5 shadow-lg shadow-slate-300/45 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold">{title}</h2>
            </div>
            {children}
        </section>
    );
}

export function ChartBox({ children }) {
    return <div className="h-72 min-h-72 w-full">{children}</div>;
}

export function Empty({ text }) {
    return (
        <div className="rounded-md border border-dashed border-slate-300 bg-[#f7f9fb] px-4 py-6 text-center text-sm text-slate-500">
            {text}
        </div>
    );
}

export function NavButton({ icon: Icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition ${active ? 'bg-white text-[#111827]' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
        >
            <Icon size={18} />
            {label}
        </button>
    );
}

export function MiniNav({ icon: Icon, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex h-11 items-center justify-center rounded-md ${active ? 'bg-[#14211d] text-white' : 'bg-slate-100 text-slate-600'}`}
        >
            <Icon size={18} />
        </button>
    );
}

export function WelcomePoint({ title, text }) {
    return (
        <div className="rounded-md border border-slate-200 bg-[#f7f9fb] p-4">
            <p className="font-semibold text-[#14211d]">{title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
        </div>
    );
}

export function PreviewStat({ label, value, tone }) {
    const colors = {
        emerald: 'text-emerald-700 bg-emerald-50',
        rose: 'text-rose-700 bg-rose-50',
        blue: 'text-blue-700 bg-blue-50',
    };

    return (
        <div className={`rounded-md px-3 py-3 ${colors[tone]}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">{label}</p>
            <p className="mt-1 text-lg font-semibold">{value}</p>
        </div>
    );
}

export function PreviewRow({ title, meta, value, tone }) {
    return (
        <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-3">
            <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-slate-500">{meta}</p>
            </div>
            <p className={`font-semibold ${tone}`}>{value}</p>
        </div>
    );
}

export function DarkStat({ label, value, color }) {
    return (
        <div className="rounded-md bg-white/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
            <p className={`mt-1 text-lg font-semibold ${color}`}>{value}</p>
        </div>
    );
}

export function Metric({ title, value, icon: Icon, tone }) {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-700',
        blue: 'bg-blue-50 text-blue-700',
        rose: 'bg-rose-50 text-rose-700',
        amber: 'bg-amber-50 text-amber-700',
    };

    return (
        <div className="rounded-lg border border-white bg-white/94 p-5 shadow-lg shadow-slate-300/45 backdrop-blur">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <div className={`flex size-10 items-center justify-center rounded-md ${colors[tone]}`}>
                    <Icon size={20} />
                </div>
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-normal">{value}</p>
        </div>
    );
}

export function Row({ title, meta, value, tone = 'text-slate-900' }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:bg-[#f7f9fb]">
            <div className="min-w-0">
                <p className="truncate font-semibold">{title}</p>
                <p className="truncate text-sm text-slate-500">{meta}</p>
            </div>
            <p className={`shrink-0 font-semibold ${tone}`}>{value}</p>
        </div>
    );
}

export function Input({ label, value, onChange, type = 'text' }) {
    return (
        <label className="block text-sm font-semibold text-slate-700">
            {label}
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-slate-200 bg-[#f7f9fb] px-3 outline-none transition focus:border-[#18b875] focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
        </label>
    );
}

export function Select({ label, value, onChange, options }) {
    return (
        <label className="block text-sm font-semibold text-slate-700">
            {label}
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-slate-200 bg-[#f7f9fb] px-3 outline-none transition focus:border-[#18b875] focus:bg-white focus:ring-4 focus:ring-emerald-100"
            >
                {options.map(([optionValue, optionLabel]) => (
                    <option key={optionValue} value={optionValue}>
                        {optionLabel}
                    </option>
                ))}
            </select>
        </label>
    );
}
