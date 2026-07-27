export const today = new Date().toISOString().slice(0, 10);

export function money(value) {
    return `$${Number(value || 0).toFixed(2)}`;
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
