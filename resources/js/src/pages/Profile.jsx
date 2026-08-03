import { useState } from 'react';
import { KeyRound, Save, UserCog } from 'lucide-react';
import { api } from '../lib/api.js';
import { readError } from '../lib/format.js';
import { CURRENCY_OPTIONS } from '../lib/currencies.js';
import { toast } from '../components/Toast.jsx';
import { Input, Select, Panel } from '../components/ui.jsx';

export default function Profile({ user, onUpdated }) {
    const [form, setForm] = useState({ name: user?.name || '', base_currency: user?.base_currency || 'USD' });
    const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [saving, setSaving] = useState(false);
    const [savingPw, setSavingPw] = useState(false);
    const [pwError, setPwError] = useState('');

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
        </div>
    );
}
