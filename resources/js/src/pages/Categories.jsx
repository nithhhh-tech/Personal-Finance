import { useState } from 'react';
import CrudPanel from '../components/CrudPanel.jsx';
import { Input, Select } from '../components/ui.jsx';
import { api } from '../lib/api.js';

export default function Categories({ categories, onCreated }) {
    const [form, setForm] = useState({ name: '', type: 'expense', color: '#2563eb' });

    return (
        <CrudPanel
            title="New category"
            onSubmit={async () => {
                await api.post('/categories', form);
                setForm({ name: '', type: 'expense', color: '#2563eb' });
                onCreated();
            }}
            fields={(
                <>
                    <Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
                    <Select label="Type" value={form.type} onChange={(type) => setForm({ ...form, type })} options={[['expense', 'Spent'], ['income', 'Earned']]} />
                    <Input label="Color" type="color" value={form.color} onChange={(color) => setForm({ ...form, color })} />
                </>
            )}
            listTitle="Categories"
            items={categories.map((category) => ({
                id: category.id,
                title: category.name,
                meta: category.type,
                value: category.color,
            }))}
        />
    );
}
