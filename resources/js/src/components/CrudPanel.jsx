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
        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '400px 1fr' }}>
            <Panel title={title}>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {fields}
                    {error && <p className="form-error">{error}</p>}
                    <button className="btn-apple-blue" style={{ alignSelf: 'flex-start' }} id="crud-create-btn">
                        <Plus size={16} />
                        Create Item
                    </button>
                </form>
            </Panel>

            <Panel title={listTitle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {items.length === 0 && <Empty text="Nothing here yet." />}
                    {items.map((item) => (
                        <Row key={item.id} title={item.title} meta={item.meta} value={item.value} />
                    ))}
                </div>
            </Panel>
        </div>
    );
}
