export const today = new Date().toISOString().slice(0, 10);
export const currentMonth = today.slice(0, 7);

export function money(value, currency = 'USD') {
    const amount = Number(value || 0);

    if (currency === 'KHR') return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)} KHR`;

    return `$${amount.toFixed(2)}`;
}

export function buildMonthlyData(transactions) {
    const map = new Map();

    transactions.forEach((item) => {
        const name = item.transaction_date?.slice(5, 10) || 'Today';
        const current = map.get(name) || { name, income: 0, expense: 0 };
        current[item.type] += Number(item.base_amount || 0);
        map.set(name, current);
    });

    return Array.from(map.values()).slice(0, 10).reverse();
}

export function viewTitle(view) {
    return {
        dashboard: 'Dashboard',
        transactions: 'Money Records',
        budgets: 'Monthly Budgets',
        reports: 'Reports',
        accounts: 'Wallets',
        categories: 'Categories',
    }[view] || 'Dashboard';
}

export function shortDate(value) {
    return value ? value.slice(0, 10) : today;
}

export function readError(error) {
    const data = error.response?.data;
    if (data?.errors) return Object.values(data.errors).flat()[0];
    if (data?.message) return data.message;
    return 'Something went wrong. Please try again.';
}

export function coffeeColor(hexColor) {
    const map = {
        '#5f8575': '#c99a52', // Salary -> Caramel Gold
        '#a59285': '#c8a47a', // Allowance -> Latte
        '#c15c3d': '#6b3f24', // Food -> Espresso
        '#bc6c25': '#d07b3f', // Transport -> Cinnamon
        '#4e3629': '#8a5a2b', // Bills -> Mocha
        '#e6a15c': '#e0b46a', // Shopping -> Cream Gold
        '#d4a373': '#b07b3f', // Savings -> Caramel
        '#0071e3': '#7a4a26', // Brand blue -> Coffee Brown
    };
    return map[hexColor?.toLowerCase()] || hexColor;
}

