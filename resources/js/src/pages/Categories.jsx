import { useState } from 'react';
import CrudPanel from '../components/CrudPanel.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.jsx';
import { api } from '../lib/api.js';

export default function Categories({ categories, onCreated }) {
    const [form, setForm] = useState({ name: '', type: 'expense', color: '#3b82f6' });

    return (
        <CrudPanel
            title="New category"
            onSubmit={async () => {
                await api.post('/categories', form);
                setForm({ name: '', type: 'expense', color: '#3b82f6' });
                onCreated();
            }}
            fields={(
                <>
                    <div className="space-y-2">
                        <Label htmlFor="cat-name">Name</Label>
                        <Input id="cat-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cat-type">Type</Label>
                        <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                            <SelectTrigger id="cat-type" className="w-full">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expense">Spent</SelectItem>
                                <SelectItem value="income">Earned</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cat-color">Color</Label>
                        <div className="flex items-center gap-3">
                            <input
                                id="cat-color"
                                type="color"
                                value={form.color}
                                onChange={(e) => setForm({ ...form, color: e.target.value })}
                                className="size-10 rounded-md border border-input cursor-pointer bg-background p-1"
                            />
                            <span className="font-mono text-xs text-muted-foreground">{form.color}</span>
                        </div>
                    </div>
                </>
            )}
            listTitle="Categories"
            items={categories.map((category) => ({
                id: category.id,
                title: category.name,
                meta: category.type === 'expense' ? 'Spent' : 'Earned',
                value: (
                    <span className="flex items-center gap-2">
                        <span className="size-3 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="font-mono text-xs text-muted-foreground">{category.color}</span>
                    </span>
                ),
            }))}
        />
    );
}
