import { useState } from 'react';
import { Plus } from 'lucide-react';
import { readError } from '../lib/format.js';
import { Empty, Panel, Row } from './ui.jsx';

export default function CrudPanel({ title, fields, onSubmit, listTitle, items }) {
    const [error, setError] = useState('');

    async function submit(event) {
        event.preventDefault();
        setError('');

        try {
            await onSubmit();
        } catch (err) {
            setError(readError(err));
        }
    }

    return (
        <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
            <Panel title={title}>
                <form onSubmit={submit} className="space-y-4">
                    {fields}
                    {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                    <button className="inline-flex h-11 items-center gap-2 rounded-md bg-[#18b875] px-4 font-semibold text-white shadow-lg shadow-emerald-200/70 hover:bg-[#119662]">
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
