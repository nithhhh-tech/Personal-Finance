export const translations = {
    en: {
        appName: "Personal Finance",
        appDesc: "Daily Tracker",
        dashboard: "Dashboard",
        transactions: "Transactions",
        wallets: "Wallets",
        categories: "Categories",
        netBalance: "Net Balance",
        earned: "Earned",
        spent: "Spent",
        left: "Left",
        recentTransactions: "Recent Transactions",
        addRecord: "Add money record",
        searchPlaceholder: "Search by description or category",
        noTransactions: "No money records found.",
        // ... add more as needed
    },
    km: {
        appName: "ហិរញ្ញវត្ថុផ្ទាល់ខ្លួន",
        appDesc: "ការតាមដានប្រចាំថ្ងៃ",
        dashboard: "ផ្ទាំងគ្រប់គ្រង",
        transactions: "ប្រតិបត្តិការ",
        wallets: "កាបូប",
        categories: "ប្រភេទ",
        netBalance: "សមតុល្យសុទ្ធ",
        earned: "ចំណូល",
        spent: "ចំណាយ",
        left: "នៅសល់",
        recentTransactions: "ប្រតិបត្តិការថ្មីៗ",
        addRecord: "កត់ត្រាប្រាក់",
        searchPlaceholder: "ស្វែងរកតាមការពិពណ៌នា ឬប្រភេទ",
        noTransactions: "រកមិនឃើញប្រតិបត្តិការទេ។",
        // ... add more as needed
    }
};

export const getTranslation = (lang, key) => {
    return translations[lang]?.[key] || translations['en'][key] || key;
};
