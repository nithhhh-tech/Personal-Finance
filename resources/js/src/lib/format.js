export const today = new Date().toISOString().slice(0, 10);
export const currentMonth = today.slice(0, 7);

export function money(value, currency = 'USD') {
    const amount = Number(value || 0);

    try {
        const noDecimalCurrencies = ['KHR', 'VND', 'JPY'];
        const decimals = noDecimalCurrencies.includes(currency) ? 0 : 2;

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(amount);
    } catch {
        if (currency === 'KHR') return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)} KHR`;
        return `${currency} ${amount.toFixed(2)}`;
    }
}

export function buildMonthlyData(transactions) {
    const map = new Map();
    const list = Array.isArray(transactions) ? transactions : (Array.isArray(transactions?.data) ? transactions.data : []);

    list.forEach((item) => {
        if (!item) return;
        const name = item.transaction_date?.slice(5, 10) || 'Today';
        const current = map.get(name) || { name, income: 0, expense: 0 };
        const typeKey = item.type === 'income' ? 'income' : 'expense';
        current[typeKey] = (current[typeKey] || 0) + Number(item.base_amount || 0);
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
        profile: 'Profile & Settings',
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
