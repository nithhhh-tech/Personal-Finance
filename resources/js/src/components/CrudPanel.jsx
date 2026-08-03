import { useState } from 'react';
import { Plus } from 'lucide-react';
import { readError } from '../lib/format.js';
import { toast } from './Toast.jsx';
import { Empty, Panel, Row } from './ui.jsx';

export default function CrudPanel({ title, fields, onSubmit, listTitle, items }) {
    const [error, setError] = useState('');

    async function submit(event) {
        event.preventDefault();
        setError('');

        try {
            await onSubmit();
            toast('Created successfully!', 'success');
        } catch (err) {
            const msg = readError(err);
            setError(msg);
            toast(msg, 'error');
        }
    }

    return (
        <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
            <Panel title={title}>
                <form onSubmit={submit} className="space-y-4">
                    {fields}
                    {error && <p className="rounded-md border border-red-300/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">{error}</p>}
                    <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#d7a86e] px-4 font-bold text-[#2a1a12] shadow-lg shadow-black/20 hover:bg-[#e8bb82] sm:w-auto">
                        <Plus size={18} />
                        Create
                    </button>
                </form>
            </Panel>
            <Panel title={listTitle}>
                <div className="space-y-3">
                    {items.length === 0 && <Empty text="Nothing here yet." />}
                    {items.map((item) => <Row key={item.id} title={item.title} meta={item.meta} value={item.value} />)}
                </div>
            </Panel>
        </div>
    );
}
