import { useState } from 'react';
import { KeyRound, Loader2, LogOut, Plus, RotateCcw, Save, Trash2, UserCog, Zap } from 'lucide-react';
import { api } from '../lib/api.js';
import { readError } from '../lib/format.js';
import { CURRENCY_OPTIONS } from '../lib/currencies.js';
import { toast } from '../components/Toast.jsx';
import { Input, Select, Panel } from '../components/ui.jsx';
import { DEFAULT_QUICK_PRESETS, getQuickPresets, saveQuickPresets } from '../lib/quickPresets.js';

export default function Profile({ categories = [], user, onUpdated, onLogout }) {
    const [form, setForm] = useState({ name: user?.name || '', base_currency: user?.base_currency || 'USD' });
    const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [saving, setSaving] = useState(false);
    const [savingPw, setSavingPw] = useState(false);
    const [pwError, setPwError] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // State for Quick Expense Presets Settings
    const [presets, setPresets] = useState(() => getQuickPresets());
    const [newPreset, setNewPreset] = useState({ label: '', amount: '', mainName: 'Food', subName: '' });

    const parentCategories = categories.filter((c) => c.type === 'expense' && !c.parent_id);

    async function saveProfile(e) {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/profile', form);
            toast('Profile updated successfully!', 'success');
            onUpdated();
        } catch (err) {
            toast(readError(err), 'error');
        } finally {
            setSaving(false);
        }
    }

    async function changePassword(e) {
        e.preventDefault();
        setPwError('');
        setSavingPw(true);
        try {
            await api.post('/profile/password', pwForm);
            toast('Password changed successfully!', 'success');
            setPwForm({ current_password: '', password: '', password_confirmation: '' });
        } catch (err) {
            setPwError(readError(err));
        } finally {
            setSavingPw(false);
        }
    }

    function handleUpdatePresetAmount(id, newAmount) {
        const next = presets.map((p) => (p.id === id ? { ...p, amount: Number(newAmount) || 0 } : p));
        setPresets(next);
        saveQuickPresets(next);
        toast('Quick preset updated!', 'info');
    }

    function handleDeletePreset(id) {
        const next = presets.filter((p) => p.id !== id);
        setPresets(next);
        saveQuickPresets(next);
        toast('Shortcut removed.', 'info');
    }

    function handleAddPreset(e) {
        e.preventDefault();
        if (!newPreset.label.trim() || !newPreset.amount) {
            toast('Please enter shortcut name and amount.', 'warning');
            return;
        }
        const created = {
            id: String(Date.now()),
            label: newPreset.label.trim(),
            amount: Number(newPreset.amount) || 0,
            mainName: newPreset.mainName || 'Food',
            subName: newPreset.subName.trim(),
        };
        const next = [...presets, created];
        setPresets(next);
        saveQuickPresets(next);
        setNewPreset({ label: '', amount: '', mainName: 'Food', subName: '' });
        toast(`Added shortcut "${created.label}"!`, 'success');
    }

    function handleResetPresets() {
        setPresets(DEFAULT_QUICK_PRESETS);
        saveQuickPresets(DEFAULT_QUICK_PRESETS);
        toast('Reset to default quick expense shortcuts!', 'info');
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <Panel title="Profile Settings">
                <form onSubmit={saveProfile} className="space-y-4">
                    <div className="flex items-center gap-3 rounded-md border border-[#8f633e]/40 bg-[#2a1a12]/60 px-4 py-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#d7a86e] text-xl font-black text-[#2a1a12]">
                            {(user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-[#fff8ef]">{user?.name}</p>
                            <p className="text-sm text-[#b89a7f]">{user?.email}</p>
                        </div>
                    </div>
                    <Input label="Display name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
                    <Select label="Base currency" value={form.base_currency} onChange={(base_currency) => setForm({ ...form, base_currency })} options={CURRENCY_OPTIONS} />
                    <button
                        disabled={saving}
                        className="inline-flex h-11 items-center gap-2 rounded-md bg-[#d7a86e] px-5 font-bold text-[#2a1a12] hover:bg-[#e8bb82] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save size={17} />
                        {saving ? 'Saving...' : 'Save changes'}
                    </button>
                </form>
            </Panel>

            {/* ⚡️ Quick 1-Tap Expense Settings */}
            <Panel title="⚡️ Quick 1-Tap Expense Shortcuts (Settings)">
                <div className="space-y-4">
                    <p className="text-xs text-[#d9c4ad] leading-relaxed">
                        Customize your quick 1-tap expense shortcuts (e.g. ☕️ Coffee $1.50, 🍜 Breakfast $2.00, ⛽️ Fuel $5.00). These shortcuts will appear in your form for instant pre-filling!
                    </p>

                    {/* Presets List */}
                    <div className="space-y-2.5">
                        {presets.map((preset) => (
                            <div key={preset.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#8f633e]/40 bg-[#2a1a12]/70 p-3">
                                <div className="min-w-0 flex-1">
                                    <p className="font-extrabold text-[#fff8ef] text-sm">{preset.label}</p>
                                    <p className="text-[11px] text-[#b89a7f]">
                                        Category: {preset.mainName} {preset.subName ? `› ${preset.subName}` : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[#d9c4ad] font-semibold">{user?.base_currency || '$'}</span>
                                    <input
                                        type="number"
                                        step="any"
                                        value={preset.amount}
                                        onChange={(e) => handleUpdatePresetAmount(preset.id, e.target.value)}
                                        className="h-9 w-20 rounded border border-[#8f633e] bg-[#3a251a] px-2 text-center text-xs font-bold text-[#f2c38b] outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleDeletePreset(preset.id)}
                                        className="p-1.5 text-[#b89a7f] hover:text-red-400"
                                        title="Delete shortcut"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add New Quick Preset Form */}
                    <form onSubmit={handleAddPreset} className="mt-4 rounded-xl border border-[#8f633e]/50 bg-[#3a251a]/80 p-4 space-y-3">
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#f2c38b] flex items-center gap-1.5">
                            <Plus size={14} /> Add New Quick Shortcut
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                                label="Shortcut Name & Emoji"
                                placeholder="e.g. 🥤 Boba Tea or 🚕 Taxi"
                                value={newPreset.label}
                                onChange={(label) => setNewPreset({ ...newPreset, label })}
                            />
                            <Input
                                label="Default Amount"
                                type="number"
                                placeholder="e.g. 3.50"
                                value={newPreset.amount}
                                onChange={(amount) => setNewPreset({ ...newPreset, amount })}
                            />
                            <Select
                                label="Main Category"
                                value={newPreset.mainName}
                                onChange={(mainName) => setNewPreset({ ...newPreset, mainName })}
                                options={parentCategories.length ? parentCategories.map((c) => [c.name, c.name]) : [['Food', 'Food'], ['Transport', 'Transport'], ['Bills', 'Bills'], ['Shopping', 'Shopping']]}
                            />
                            <Input
                                label="Sub-Category Name (Optional)"
                                placeholder="e.g. Drinks, Fuel, Snacks"
                                value={newPreset.subName}
                                onChange={(subName) => setNewPreset({ ...newPreset, subName })}
                            />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <button
                                type="button"
                                onClick={handleResetPresets}
                                className="inline-flex items-center gap-1 text-xs text-[#b89a7f] hover:text-white"
                            >
                                <RotateCcw size={13} /> Reset Defaults
                            </button>
                            <button
                                type="submit"
                                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#d7a86e] px-4 text-xs font-extrabold text-[#2a1a12] hover:bg-[#e8bb82]"
                            >
                                <Zap size={14} /> Add Quick Shortcut
                            </button>
                        </div>
                    </form>
                </div>
            </Panel>

            <Panel title="Change Password">
                <form onSubmit={changePassword} className="space-y-4">
                    <Input label="Current password" type="password" value={pwForm.current_password} onChange={(current_password) => setPwForm({ ...pwForm, current_password })} />
                    <Input label="New password" type="password" value={pwForm.password} onChange={(password) => setPwForm({ ...pwForm, password })} />
                    <Input label="Confirm new password" type="password" value={pwForm.password_confirmation} onChange={(password_confirmation) => setPwForm({ ...pwForm, password_confirmation })} />
                    {pwError && <p className="rounded-md border border-red-300/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">{pwError}</p>}
                    <button
                        disabled={savingPw}
                        className="inline-flex h-11 items-center gap-2 rounded-md bg-[#d7a86e] px-5 font-bold text-[#2a1a12] hover:bg-[#e8bb82] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <KeyRound size={17} />
                        {savingPw ? 'Updating...' : 'Change password'}
                    </button>
                </form>
            </Panel>

            {/* Account Session & Logout */}
            <Panel title="Account Session & Security">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#8f633e]/40 bg-[#2a1a12]/60 p-4">
                    <div>
                        <p className="font-bold text-[#fff8ef]">Sign Out of PocketLedger</p>
                        <p className="mt-0.5 text-xs text-[#b89a7f]">Safely end your session on this browser.</p>
                    </div>
                    <button
                        type="button"
                        disabled={isLoggingOut}
                        onClick={async () => {
                            setIsLoggingOut(true);
                            toast('Signing out safely...', 'info');
                            try {
                                await onLogout?.();
                            } finally {
                                setIsLoggingOut(false);
                            }
                        }}
                        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-[#d7a86e] px-4 text-xs font-extrabold text-[#2a1a12] hover:bg-[#e8bb82] disabled:opacity-60 transition shadow-sm"
                    >
                        {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                        {isLoggingOut ? 'Signing out...' : 'Log Out'}
                    </button>
                </div>
            </Panel>
        </div>
    );
}
