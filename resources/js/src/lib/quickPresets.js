export const DEFAULT_QUICK_PRESETS = [
    { id: '1', label: '☕️ Coffee', amount: 1.5, mainName: 'Food', subName: 'Coffee' },
    { id: '2', label: '🍜 Breakfast', amount: 2.0, mainName: 'Food', subName: 'Breakfast' },
    { id: '3', label: '⛽️ Fuel', amount: 5.0, mainName: 'Transport', subName: 'Fuel' },
    { id: '4', label: '🥤 Drink', amount: 1.0, mainName: 'Food', subName: 'Drinks' },
];

export function getQuickPresets() {
    try {
        const stored = localStorage.getItem('pocketledger_quick_presets');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.error('Error reading quick presets:', e);
    }
    return DEFAULT_QUICK_PRESETS;
}

export function saveQuickPresets(presets) {
    try {
        localStorage.setItem('pocketledger_quick_presets', JSON.stringify(presets));
    } catch (e) {
        console.error('Error saving quick presets:', e);
    }
}
