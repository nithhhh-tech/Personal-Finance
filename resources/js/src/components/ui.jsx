export function Panel({ title, children }) {
    return (
        <section className="rounded-lg border border-[#8f633e]/45 bg-[#3a251a]/88 p-5 text-[#f8efe3] shadow-lg shadow-black/20 backdrop-blur">
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
        <div className="rounded-md border border-dashed border-[#8f633e]/55 bg-[#2a1a12]/45 px-4 py-6 text-center text-sm text-[#d9c4ad]">
            {text}
        </div>
    );
}

export function NavButton({ icon: Icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition ${active ? 'bg-[#d7a86e] text-[#2a1a12]' : 'text-[#d9c4ad] hover:bg-[#3a251a] hover:text-[#fff8ef]'}`}
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
            className={`flex h-11 items-center justify-center rounded-md ${active ? 'bg-[#d7a86e] text-[#2a1a12]' : 'bg-[#2a1a12]/65 text-[#d9c4ad]'}`}
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

export function DarkStat({ label, value, color }) {
    return (
        <div className="rounded-md border border-[#8f633e]/35 bg-[#3a251a]/85 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#d9c4ad]">{label}</p>
            <p className={`mt-1 text-lg font-semibold ${color}`}>{value}</p>
        </div>
    );
}

export function Metric({ title, value, icon: Icon, tone }) {
    const colors = {
        emerald: 'bg-[#244238] text-[#89e6ba]',
        blue: 'bg-[#2f3a56] text-[#9dbbff]',
        rose: 'bg-[#513024] text-[#f0a36f]',
        amber: 'bg-[#5a3d22] text-[#f2c38b]',
    };

    return (
        <div className="rounded-lg border border-[#8f633e]/45 bg-[#3a251a]/88 p-5 text-[#f8efe3] shadow-lg shadow-black/20 backdrop-blur">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#d9c4ad]">{title}</p>
                <div className={`flex size-10 items-center justify-center rounded-md ${colors[tone]}`}>
                    <Icon size={20} />
                </div>
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-normal">{value}</p>
        </div>
    );
}

export function Row({ title, meta, value, tone = 'text-[#f2c38b]' }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-md border border-[#8f633e]/45 bg-[#2a1a12]/45 px-4 py-3 text-[#f8efe3] transition hover:border-[#d7a86e]/60 hover:bg-[#4a3022]/65">
            <div className="min-w-0">
                <p className="truncate font-semibold">{title}</p>
                <p className="truncate text-sm text-[#d9c4ad]">{meta}</p>
            </div>
            <p className={`shrink-0 font-semibold ${tone}`}>{value}</p>
        </div>
    );
}

export function Input({ label, value, onChange, type = 'text', variant = 'light' }) {
    const dark = variant === 'dark' || variant === 'light';

    return (
        <label className={`block text-sm font-semibold ${dark ? 'text-[#d9c4ad]' : 'text-slate-700'}`}>
            {label}
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={`mt-1 h-11 w-full rounded-md px-3 outline-none transition ${dark ? 'border border-[#8f633e]/60 bg-[#2a1a12]/70 text-[#fff8ef] focus:border-[#d7a86e] focus:ring-4 focus:ring-[#d7a86e]/15' : 'border border-slate-200 bg-[#f7f9fb] focus:border-[#18b875] focus:bg-white focus:ring-4 focus:ring-emerald-100'}`}
            />
        </label>
    );
}

export function Select({ label, value, onChange, options, variant = 'light' }) {
    const dark = variant === 'dark' || variant === 'light';

    return (
        <label className={`block text-sm font-semibold ${dark ? 'text-[#d9c4ad]' : 'text-slate-700'}`}>
            {label}
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={`mt-1 h-11 w-full rounded-md px-3 outline-none transition ${dark ? 'border border-[#8f633e]/60 bg-[#2a1a12]/70 text-[#fff8ef] focus:border-[#d7a86e] focus:ring-4 focus:ring-[#d7a86e]/15' : 'border border-slate-200 bg-[#f7f9fb] focus:border-[#18b875] focus:bg-white focus:ring-4 focus:ring-emerald-100'}`}
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
