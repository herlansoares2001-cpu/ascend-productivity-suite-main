import { Account, Transaction } from "@/types/finance";

// MOCK_ACCOUNTS Deprecated - Now using Supabase
export const MOCK_ACCOUNTS: Account[] = []; // Empty default or removed entirely.
// Better to export empty array for safety if referenced elsewhere temporarily.

/**
 * Recalcula o saldo atual de uma conta com base no saldo inicial e transações (APENAS PAGAS)
 */
export function calculateAccountBalance(account: Account, transactions: Transaction[]): number {
    // Saldo Atual = Apenas transações efetivadas (paid)
    // Se status for undefined (legado), assume paid para compatibilidade.
    const accountTransactions = transactions.filter(t =>
        t.account_id === account.id && (t.is_paid === true || t.status === 'paid')
    );

    const totalIncome = accountTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalExpense = accountTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    return account.initial_balance + totalIncome - totalExpense;
}

/**
 * Gera os registros de transação para uma transferência
 */
export function createTransferTransactions(
    originAccount: Account,
    destinationAccount: Account,
    amount: number,
    date: string,
    description: string
): [Transaction, Transaction] {
    const transferId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Saída da conta de origem
    const originTx: Transaction = {
        id: crypto.randomUUID(),
        user_id: originAccount.user_id,
        account_id: originAccount.id,
        description: `Transferência para ${destinationAccount.name} - ${description}`,
        amount: amount,
        type: 'expense',
        category: 'transfer',
        transaction_date: date,
        created_at: now,
        is_transfer: true,
        transfer_id: transferId,
        related_account_id: destinationAccount.id,
        is_paid: true,
        status: 'paid', // Transferências são imediatas
        is_recurring: false,
        is_installment: false,
        card_id: undefined // Transferência não usa cartão
    };

    // Entrada na conta de destino
    const destinationTx: Transaction = {
        id: crypto.randomUUID(),
        user_id: destinationAccount.user_id,
        account_id: destinationAccount.id,
        description: `Transferência de ${originAccount.name} - ${description}`,
        amount: amount,
        type: 'income',
        category: 'transfer',
        transaction_date: date,
        created_at: now,
        is_transfer: true,
        transfer_id: transferId,
        related_account_id: originAccount.id,
        is_paid: true,
        status: 'paid',
        is_recurring: false,
        is_installment: false,
        card_id: undefined
    };

    return [originTx, destinationTx];
}

/**
 * Calcula o saldo projetado (incluindo transações futuras/pendentes)
 */
export function calculateProjectedBalance(account: Account, transactions: Transaction[]): number {
    // Saldo Projetado = Considera TODAS as transações (paid + pending)
    const accountTransactions = transactions.filter(t => t.account_id === account.id);

    const totalIncome = accountTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalExpense = accountTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    return account.initial_balance + totalIncome - totalExpense;
}
