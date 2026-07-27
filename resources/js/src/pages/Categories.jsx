import { useState } from 'react';
import CrudPanel from '../components/CrudPanel.jsx';
import { Input, Select } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { coffeeColor } from '../lib/format.js';

export default function Categories({ categories, onCreated }) {
    const [form, setForm] = useState({ name: '', type: 'expense', color: '#E6A15C' });

    return (
        <CrudPanel
            title="New category"
            onSubmit={async () => {
                await api.post('/categories', form);
                setForm({ name: '', type: 'expense', color: '#E6A15C' });
                onCreated();
            }}
            fields={(
                <>
                    <Input label="Name"  value={form.name}  onChange={(name)  => setForm({ ...form, name })} />
                    <Select label="Type" value={form.type}  onChange={(type)  => setForm({ ...form, type })} options={[['expense', 'Spent'], ['income', 'Earned']]} />
                    <div>
                        <label className="form-label">Color</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <input
                                type="color"
                                value={form.color}
                                onChange={(e) => setForm({ ...form, color: e.target.value })}
                                style={{ width: 44, height: 44, borderRadius: 10, border: '1px solid var(--apple-border)', cursor: 'pointer', padding: 3, background: '#FFFFFF' }}
                            />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--apple-sub)' }}>{form.color}</span>
                        </div>
                    </div>
                </>
            )}
            listTitle="Categories"
            items={categories.map((category) => ({
                id:    category.id,
                title: category.name,
                meta:  category.type === 'expense' ? 'Spent' : 'Earned',
                value: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="color-swatch" style={{ background: coffeeColor(category.color) }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--apple-sub)' }}>{coffeeColor(category.color)}</span>
                    </span>
                ),
            }))}
        />
    );
}

