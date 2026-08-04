export function Panel({ title, children }) {
    return (
        <section className="rounded-lg border border-[#8f633e]/45 bg-[#3a251a]/88 p-4 text-[#f8efe3] shadow-lg shadow-black/20 backdrop-blur sm:p-5">
            <div className="mb-3 flex items-center justify-between sm:mb-4">
                <h2 className="text-sm font-semibold sm:text-base">{title}</h2>
            </div>
            {children}
        </section>
    );
}

export function ChartBox({ children }) {
    return <div className="h-64 min-h-64 w-full sm:h-72 sm:min-h-72">{children}</div>;
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

export function MiniNav({ icon: Icon, label, active, onClick, badge }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex h-13 w-full min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-semibold leading-none transition-all duration-150 ${active ? 'bg-[#d7a86e] text-[#2a1a12] shadow-md shadow-black/30' : 'text-[#d9c4ad] hover:bg-[#3a251a]/70 hover:text-[#fff8ef]'}`}
        >
            <Icon size={19} className="shrink-0" />
            <span className="w-full truncate text-center font-semibold leading-none">{label}</span>
            {badge && (
                <span className="absolute top-1.5 right-2 flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d7a86e] opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-[#f2c38b]"></span>
                </span>
            )}
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
        <div className="flex flex-col justify-center rounded-lg border border-[#8f633e]/35 bg-[#3a251a]/85 px-2.5 py-2 text-center sm:p-3 sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#d9c4ad] sm:text-xs sm:tracking-[0.14em]">{label}</p>
            <p className={`mt-0.5 truncate text-base font-bold sm:mt-1 sm:text-lg ${color}`}>{value}</p>
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
        <div className="rounded-lg border border-[#8f633e]/45 bg-[#3a251a]/88 p-3.5 text-[#f8efe3] shadow-lg shadow-black/20 backdrop-blur sm:p-5">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#d9c4ad] sm:text-sm">{title}</p>
                <div className={`flex size-9 items-center justify-center rounded-md sm:size-10 ${colors[tone]}`}>
                    <Icon size={18} />
                </div>
            </div>
            <p className="mt-3 truncate text-lg font-bold tracking-normal sm:mt-4 sm:text-2xl">{value}</p>
        </div>
    );
}

export function Row({ title, meta, value, tone = 'text-[#f2c38b]', action = null }) {
    return (
        <div className="flex flex-col gap-2 rounded-lg border border-[#8f633e]/45 bg-[#2a1a12]/45 p-3 text-[#f8efe3] transition hover:border-[#d7a86e]/60 hover:bg-[#4a3022]/65 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3">
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold sm:text-base">{title}</p>
                <p className="truncate text-xs text-[#d9c4ad] sm:text-sm">{meta}</p>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[#8f633e]/20 pt-2 sm:border-t-0 sm:pt-0 sm:justify-end">
                <p className={`text-sm font-bold sm:text-base ${tone}`}>{value}</p>
                {action && <div className="flex items-center gap-1.5">{action}</div>}
            </div>
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

export function WalletCard({ name, type, currency, balance, onClick }) {
    const typeConfig = {
        aba: { label: 'ABA Bank', bg: 'bg-[#182d47]/80 border-[#3182ce]/50 text-[#90cdf4]', badge: 'bg-[#2b6cb0] text-white' },
        wing: { label: 'Wing Bank', bg: 'bg-[#193d2d]/80 border-[#38a169]/50 text-[#9ae6b4]', badge: 'bg-[#2f855a] text-white' },
        cash: { label: 'Cash Wallet', bg: 'bg-[#422e19]/80 border-[#d69e2e]/50 text-[#f6ad55]', badge: 'bg-[#b7791f] text-white' },
        savings: { label: 'Savings Vault', bg: 'bg-[#2d1f47]/80 border-[#805ad5]/50 text-[#d6bcfa]', badge: 'bg-[#6b46c1] text-white' },
        wallet: { label: 'Wallet', bg: 'bg-[#2a1a12]/80 border-[#8f633e]/50 text-[#f8efe3]', badge: 'bg-[#8f633e] text-white' },
    };

    const key = String(type || '').toLowerCase();
    const config = typeConfig[key] || typeConfig.wallet;

    return (
        <div
            onClick={onClick}
            className={`group relative flex flex-col justify-between rounded-xl border p-4 shadow-lg backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${config.bg} cursor-pointer`}
        >
            <div className="flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${config.badge}`}>
                    {config.label}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#d9c4ad]">{currency}</span>
            </div>
            <div className="mt-4">
                <p className="truncate text-xs font-medium text-[#d9c4ad]">{name}</p>
                <p className="mt-1 truncate text-xl font-black text-[#fff8ef]">{balance}</p>
            </div>
        </div>
    );
}

