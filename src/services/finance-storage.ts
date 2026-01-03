// Helpers para persistência local de dados financeiros que o backend ainda não suporta

export const getSavedAccountMapping = (): Record<string, string> => {
    try { return JSON.parse(localStorage.getItem('transaction_accounts') || '{}'); } catch { return {}; }
};

export const saveTransactionAccount = (txId: string, accId: string) => {
    const current = getSavedAccountMapping();
    current[txId] = accId;
    localStorage.setItem('transaction_accounts', JSON.stringify(current));
};

export const getSavedTransactionMeta = (): Record<string, any> => {
    try { return JSON.parse(localStorage.getItem('transaction_meta') || '{}'); } catch { return {}; }
};

export const saveTransactionMeta = (txId: string, meta: any) => {
    const current = getSavedTransactionMeta();
    current[txId] = { ...(current[txId] || {}), ...meta };
    localStorage.setItem('transaction_meta', JSON.stringify(current));
};
