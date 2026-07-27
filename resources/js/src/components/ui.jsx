// ── Apple Style Primitive UI components ──────────────────────────────────────────

export function Panel({ title, children, className = '' }) {
    return (
        <section className={`card animate-fade-in-up ${className}`}>
            {title && <h2 className="card-title">{title}</h2>}
            {children}
        </section>
    );
}

export function ChartBox({ children }) {
    return <div className="chart-box">{children}</div>;
}

export function Empty({ text }) {
    return <div className="empty-state">{text}</div>;
}

export function NavButton({ icon: Icon, label, active, onClick }) {
    return (
        <button onClick={onClick} className={`nav-btn${active ? ' active' : ''}`}>
            <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
            <span style={{ fontFamily: 'var(--font-sans)' }}>{label}</span>
        </button>
    );
}

export function MiniNav({ icon: Icon, active, onClick }) {
    return (
        <button onClick={onClick} className={`mobile-nav-btn${active ? ' active' : ''}`}>
            <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
        </button>
    );
}

export function WelcomePoint({ title, text }) {
    return (
        <div style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid var(--apple-border)', background: '#FFFFFF' }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--apple-dark)', marginBottom: 2 }}>{title}</p>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--apple-sub)' }}>{text}</p>
        </div>
    );
}

export function PreviewStat({ label, value, tone }) {
    const styles = {
        emerald: { background: 'rgba(95, 133, 117, 0.1)', color: '#5F8575' },
        rose:    { background: 'rgba(193, 92, 61, 0.1)', color: '#C15C3D' },
        blue:    { background: 'rgba(230, 161, 92, 0.1)',  color: '#E6A15C' },
    };

    return (
        <div style={{ ...styles[tone], borderRadius: 12, padding: '12px 14px' }}>
            <p style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8, marginBottom: 3 }}>{label}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em' }}>{value}</p>
        </div>
    );
}

export function PreviewRow({ title, meta, value, tone }) {
    const isIncome = tone?.includes('emerald');
    return (
        <div className="tx-row">
            <div>
                <p className="tx-row-title">{title}</p>
                <p className="tx-row-meta">{meta}</p>
            </div>
            <p className={`tx-row-value ${isIncome ? 'income' : 'expense'}`}>{value}</p>
        </div>
    );
}

export function DarkStat({ label, value, color }) {
    const colorMap = {
        'text-emerald-300': '#7FA392',
        'text-rose-300':    '#DE7D63',
        'text-sky-300':     '#EBB67B',
    };
    return (
        <div className="dark-stat">
            <p className="dark-stat-label">{label}</p>
            <p className="dark-stat-value" style={{ color: colorMap[color] || '#FFFFFF' }}>{value}</p>
        </div>
    );
}

export function Metric({ title, value, icon: Icon, tone }) {
    const toneClass = {
        emerald: 'tone-mint',
        rose:    'tone-coral',
        blue:    'tone-blue',
        amber:   'tone-amber',
    }[tone] || 'tone-blue';

    return (
        <div className={`metric-card ${toneClass} animate-fade-in-up`}>
            <div className={`metric-icon ${toneClass}`}>
                <Icon size={19} strokeWidth={2.2} />
            </div>
            <p className="metric-label">{title}</p>
            <p className="metric-value">{value}</p>
        </div>
    );
}

export function Row({ title, meta, value, tone = '' }) {
    const isIncome = tone.includes('emerald');
    const isExpense = tone.includes('rose');
    const valueClass = `tx-row-value${isIncome ? ' income' : isExpense ? ' expense' : ''}`;

    return (
        <div className="tx-row">
            <div style={{ minWidth: 0 }}>
                <p className="tx-row-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
                <p className="tx-row-meta"  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta}</p>
            </div>
            <p className={valueClass}>{value}</p>
        </div>
    );
}

export function Input({ label, value, onChange, type = 'text' }) {
    return (
        <div>
            <label className="form-label">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="form-input"
            />
        </div>
    );
}

export function Select({ label, value, onChange, options }) {
    return (
        <div>
            <label className="form-label">{label}</label>
            <div className="form-select-wrapper">
                <select
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="form-select"
                >
                    {options.map(([optionValue, optionLabel]) => (
                        <option key={optionValue} value={optionValue}>{optionLabel}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
