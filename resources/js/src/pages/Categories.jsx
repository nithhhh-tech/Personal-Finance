import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, FolderPlus, Tag, X, Layers, Check } from 'lucide-react';
import { api } from '../lib/api.js';
import { toast } from '../components/Toast.jsx';
import { Panel, Empty, Input, Select } from '../components/ui.jsx';

export default function Categories({ categories, onCreated }) {
    const [activeTab, setActiveTab] = useState('expense'); // 'expense' | 'income'
    const [showNewMainModal, setShowNewMainModal] = useState(false);
    const [mainForm, setMainForm] = useState({ name: '', color: '#d7a86e' });
    const [creatingMain, setCreatingMain] = useState(false);

    // Auto-seed default sub-categories if user has main categories but 0 sub-categories
    useEffect(() => {
        const hasSubcategories = categories.some((c) => c.parent_id);
        if (!hasSubcategories && categories.length > 0) {
            api.post('/categories/seed-defaults').then(() => {
                onCreated();
            }).catch(() => {});
        }
    }, []);

    // State for inline subcategory creation per parent category ID
    const [addingSubForId, setAddingSubForId] = useState(null);
    const [subInputName, setSubInputName] = useState('');
    const [subInputAmount, setSubInputAmount] = useState('');
    const [savingSub, setSavingSub] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Filter main categories (where parent_id is null/empty) matching activeTab
    const mainCategories = useMemo(() => {
        return categories.filter((c) => c.type === activeTab && !c.parent_id);
    }, [categories, activeTab]);

    // Map parent_id -> subcategories
    const subcategoryMap = useMemo(() => {
        const map = {};
        categories.forEach((c) => {
            if (c.parent_id) {
                const pId = String(c.parent_id);
                if (!map[pId]) map[pId] = [];
                map[pId].push(c);
            }
        });
        return map;
    }, [categories]);

    async function handleCreateMainCategory(e) {
        e.preventDefault();
        if (!mainForm.name.trim()) {
            toast('Please enter a category name.', 'warning');
            return;
        }
        setCreatingMain(true);
        try {
            await api.post('/categories', {
                name: mainForm.name.trim(),
                type: activeTab,
                color: mainForm.color,
                parent_id: null,
            });
            toast(`Created main category "${mainForm.name.trim()}"!`, 'success');
            setMainForm({ name: '', color: '#d7a86e' });
            setShowNewMainModal(false);
            onCreated();
        } catch (err) {
            toast(err.response?.data?.message || 'Could not create category.', 'error');
        } finally {
            setCreatingMain(false);
        }
    }

    async function handleAddSubcategory(parentId) {
        if (!subInputName.trim()) {
            toast('Please enter a subcategory name.', 'warning');
            return;
        }
        setSavingSub(true);
        try {
            await api.post('/categories', {
                name: subInputName.trim(),
                type: activeTab,
                parent_id: parentId,
                default_amount: subInputAmount ? Number(subInputAmount) : null,
            });
            toast(`Added subcategory "${subInputName.trim()}"!`, 'success');
            setSubInputName('');
            setSubInputAmount('');
            setAddingSubForId(null);
            onCreated();
        } catch (err) {
            toast(err.response?.data?.message || 'Could not add subcategory.', 'error');
        } finally {
            setSavingSub(false);
        }
    }

    async function handleDeleteCategory(id, name) {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
        setDeletingId(id);
        try {
            await api.delete(`/categories/${id}`);
            toast(`Deleted "${name}".`, 'info');
            onCreated();
        } catch (err) {
            toast('Could not delete category.', 'error');
        } finally {
            setDeletingId(null);
        }
    }

    async function handleSeedDefaults() {
        try {
            const res = await api.post('/categories/seed-defaults');
            toast(res.data.message || 'Seeded default sub-categories!', 'success');
            onCreated();
        } catch (err) {
            toast('Could not seed defaults.', 'error');
        }
    }

    return (
        <div className="space-y-6">
            {/* Header & Tabs Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#8f633e]/45 bg-[#2a1a12] p-4 text-[#f8efe3] shadow-lg">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('expense')}
                        className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition ${activeTab === 'expense' ? 'bg-[#f0a36f] text-[#2a1a12] shadow' : 'bg-[#3a251a] text-[#d9c4ad] hover:text-[#fff8ef]'}`}
                    >
                        💸 Spent Categories ({categories.filter((c) => c.type === 'expense' && !c.parent_id).length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('income')}
                        className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition ${activeTab === 'income' ? 'bg-[#89e6ba] text-[#2a1a12] shadow' : 'bg-[#3a251a] text-[#d9c4ad] hover:text-[#fff8ef]'}`}
                    >
                        💰 Earned Categories ({categories.filter((c) => c.type === 'income' && !c.parent_id).length})
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleSeedDefaults}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#8f633e] bg-[#3a251a] px-3 py-2 text-xs font-bold text-[#f2c38b] hover:bg-[#4a3022] hover:text-white transition"
                        title="Add default Coffee, Fuel, Food, Bills sub-categories"
                    >
                        <Layers size={14} />
                        ⚡️ Add Defaults
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowNewMainModal(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#d7a86e] px-4 py-2 text-xs sm:text-sm font-extrabold text-[#2a1a12] shadow hover:bg-[#e8bb82] transition"
                    >
                        <Plus size={16} />
                        + New Main Category
                    </button>
                </div>
            </div>

            {/* Modal for New Main Category */}
            {showNewMainModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-[#8f633e]/60 bg-[#3a251a] p-6 text-[#f8efe3] shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-extrabold text-[#f2c38b]">
                                Add New {activeTab === 'expense' ? 'Spent' : 'Earned'} Category
                            </h3>
                            <button onClick={() => setShowNewMainModal(false)} className="text-[#d9c4ad] hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateMainCategory} className="space-y-4">
                            <Input
                                label="Category Name"
                                placeholder="e.g. Food & Dining, Transport, Shopping"
                                value={mainForm.name}
                                onChange={(val) => setFormVal('name', val)}
                            />
                            <div>
                                <label className="block text-sm font-semibold text-[#d9c4ad]">Category Color Accent</label>
                                <div className="mt-2 flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={mainForm.color}
                                        onChange={(e) => setMainForm({ ...mainForm, color: e.target.value })}
                                        className="h-10 w-14 cursor-pointer rounded border border-[#8f633e] bg-[#2a1a12]"
                                    />
                                    <span className="text-xs font-mono text-[#d9c4ad]">{mainForm.color}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowNewMainModal(false)}
                                    className="rounded-md border border-[#8f633e]/60 px-4 py-2 text-xs font-bold text-[#d9c4ad] hover:bg-[#2a1a12]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingMain}
                                    className="rounded-md bg-[#d7a86e] px-5 py-2 text-xs font-extrabold text-[#2a1a12] hover:bg-[#e8bb82] disabled:opacity-50"
                                >
                                    {creatingMain ? 'Creating...' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Categories Cards Grid */}
            <Panel title={`${activeTab === 'expense' ? 'Spent' : 'Earned'} Categories & Sub-categories`}>
                {mainCategories.length === 0 ? (
                    <Empty text={`No ${activeTab === 'expense' ? 'spent' : 'earned'} categories created yet. Click "+ New Main Category" above to start!`} />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {mainCategories.map((mainCat) => {
                            const subs = subcategoryMap[String(mainCat.id)] || mainCat.subcategories || [];
                            const isAdding = addingSubForId === mainCat.id;

                            return (
                                <div
                                    key={mainCat.id}
                                    className="flex flex-col justify-between rounded-xl border border-[#8f633e]/45 bg-[#2a1a12]/80 p-4 shadow-md transition hover:border-[#d7a86e]/60"
                                >
                                    {/* Card Header */}
                                    <div>
                                        <div className="flex items-center justify-between border-b border-[#8f633e]/30 pb-3">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span
                                                    className="size-4 shrink-0 rounded-full shadow-sm"
                                                    style={{ backgroundColor: mainCat.color || '#d7a86e' }}
                                                />
                                                <h4 className="truncate font-extrabold text-[#fff8ef] text-base">
                                                    {mainCat.name}
                                                </h4>
                                            </div>
                                            <button
                                                type="button"
                                                disabled={deletingId === mainCat.id}
                                                onClick={() => handleDeleteCategory(mainCat.id, mainCat.name)}
                                                className="text-[#b89a7f] hover:text-red-400 p-1"
                                                title="Delete Main Category"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>

                                        {/* Subcategories List / Chips */}
                                        <div className="mt-3.5 space-y-2">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b89a7f]">
                                                Sub-categories ({subs.length})
                                            </p>
                                            {subs.length === 0 ? (
                                                <p className="text-xs italic text-[#b89a7f]/70 py-1">
                                                    No sub-categories yet (e.g. Coffee, Groceries)
                                                </p>
                                            ) : (
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {subs.map((sub) => (
                                                        <span
                                                            key={sub.id}
                                                            className="inline-flex items-center gap-1.5 rounded-full border border-[#8f633e]/50 bg-[#3a251a] px-3 py-1 text-xs font-semibold text-[#f8efe3]"
                                                        >
                                                            <Tag size={11} className="text-[#f2c38b]" />
                                                            <span>{sub.name}</span>
                                                            {sub.default_amount > 0 && (
                                                                <span className="font-mono font-bold text-[#f2c38b]">
                                                                    (${Number(sub.default_amount).toFixed(2)})
                                                                </span>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteCategory(sub.id, sub.name)}
                                                                className="ml-0.5 text-[#b89a7f] hover:text-red-300"
                                                                title="Remove subcategory"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Footer: Inline Subcategory Creation */}
                                    <div className="mt-4 border-t border-[#8f633e]/30 pt-3">
                                        {isAdding ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        autoFocus
                                                        placeholder="Sub-category name (e.g. Coffee)..."
                                                        value={subInputName}
                                                        onChange={(e) => setSubInputName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleAddSubcategory(mainCat.id);
                                                            if (e.key === 'Escape') setAddingSubForId(null);
                                                        }}
                                                        className="h-9 w-full rounded-md border border-[#8f633e] bg-[#3a251a] px-3 text-xs text-[#fff8ef] outline-none focus:border-[#d7a86e]"
                                                    />
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        placeholder="Shortcut $ (1.50)..."
                                                        value={subInputAmount}
                                                        onChange={(e) => setSubInputAmount(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleAddSubcategory(mainCat.id);
                                                            if (e.key === 'Escape') setAddingSubForId(null);
                                                        }}
                                                        className="h-9 w-28 rounded-md border border-[#8f633e] bg-[#3a251a] px-2 text-xs text-[#f2c38b] font-bold outline-none focus:border-[#d7a86e]"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setAddingSubForId(null)}
                                                        className="rounded-md border border-[#8f633e] px-3 py-1.5 text-xs text-[#d9c4ad]"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={savingSub}
                                                        onClick={() => handleAddSubcategory(mainCat.id)}
                                                        className="inline-flex items-center gap-1 rounded-md bg-[#d7a86e] px-4 py-1.5 text-xs font-extrabold text-[#2a1a12] hover:bg-[#e8bb82]"
                                                    >
                                                        <Check size={14} /> Add Sub-category
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAddingSubForId(mainCat.id);
                                                    setSubInputName('');
                                                }}
                                                className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[#8f633e]/70 bg-[#3a251a]/60 py-1.5 text-xs font-bold text-[#f2c38b] hover:border-[#d7a86e] hover:bg-[#3a251a]"
                                            >
                                                <Plus size={13} />
                                                Add Sub-category
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Panel>
        </div>
    );

    function setFormVal(key, value) {
        setMainForm((prev) => ({ ...prev, [key]: value }));
    }
}
