import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { readError } from '../lib/format.js';
import { Panel, Empty, TxRow } from './ui.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { Button } from './ui/button.jsx';

export default function CrudPanel({ title, fields, onSubmit, listTitle, items }) {
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function submit(event) {
        event.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await onSubmit();
        } catch (err) {
            setError(readError(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
            <Panel title={title}>
                <form onSubmit={submit} className="space-y-4">
                    {fields}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Button type="submit" disabled={submitting} id="crud-create-btn" className="gap-2">
                        {submitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                        Create Item
                    </Button>
                </form>
            </Panel>

            <Panel title={listTitle}>
                <div className="flex flex-col gap-3">
                    {items.length === 0 && <Empty text="Nothing here yet." />}
                    {items.map((item) => (
                        <TxRow key={item.id} title={item.title} meta={item.meta} value={item.value} />
                    ))}
                </div>
            </Panel>
        </div>
    );
}
