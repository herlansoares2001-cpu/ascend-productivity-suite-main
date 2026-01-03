import { Transaction, TransactionFrequency } from "@/types/finance";
import { addMonths, addWeeks, addYears } from "date-fns";

/**
 * Gera transações parceladas a partir de uma transação base
 */
export function generateInstallmentTransactions(
    baseTransaction: Omit<Transaction, 'id' | 'created_at' | 'installment_group_id' | 'installment_number' | 'total_installments'>,
    totalInstallments: number
): Omit<Transaction, 'id' | 'created_at'>[] {
    const transactions: Omit<Transaction, 'id' | 'created_at'>[] = [];
    const installmentGroupId = crypto.randomUUID();
    const installmentAmount = Number((baseTransaction.amount / totalInstallments).toFixed(2));

    // Ajuste de centavos na primeira parcela se necessário, ou na última?
    // Vamos simplificar: todas iguais e sobra na primeira.
    const totalCalculated = installmentAmount * totalInstallments;
    const diff = Number((baseTransaction.amount - totalCalculated).toFixed(2));

    for (let i = 0; i < totalInstallments; i++) {
        const date = new Date(baseTransaction.transaction_date);
        // Incrementa meses. Cuidado com dia 31 -> dia 28/30. addMonths do date-fns lida bem.
        const dueDate = addMonths(date, i);

        // Ajuste de centavos na primeira parcela
        const currentAmount = i === 0 ? Number((installmentAmount + diff).toFixed(2)) : installmentAmount;

        transactions.push({
            ...baseTransaction,
            amount: currentAmount,
            transaction_date: dueDate.toISOString(), // ou format
            is_installment: true,
            installment_group_id: installmentGroupId,
            installment_number: i + 1,
            total_installments: totalInstallments,
            description: `${baseTransaction.description} (${i + 1}/${totalInstallments})`,
            status: baseTransaction.status || 'pending'
        });
    }

    return transactions;
}

/**
 * Gera transações recorrentes projetadas (ex: 12 meses a frente)
 */
export function generateRecurringTransactions(
    baseTransaction: Omit<Transaction, 'id' | 'created_at' | 'recurrence_id'>,
    frequency: TransactionFrequency,
    occurrences: number = 12
): Omit<Transaction, 'id' | 'created_at'>[] {
    const transactions: Omit<Transaction, 'id' | 'created_at'>[] = [];
    const recurrenceId = crypto.randomUUID();

    for (let i = 0; i < occurrences; i++) {
        const date = new Date(baseTransaction.transaction_date);
        let dueDate = date;

        if (frequency === 'monthly') dueDate = addMonths(date, i);
        else if (frequency === 'weekly') dueDate = addWeeks(date, i);
        else if (frequency === 'yearly') dueDate = addYears(date, i);

        transactions.push({
            ...baseTransaction,
            transaction_date: dueDate.toISOString(),
            is_recurring: true,
            frequency: frequency,
            recurrence_id: recurrenceId,
            status: i === 0 ? (baseTransaction.status || 'pending') : 'pending' // Apenas a primeira pode ser 'paid' se user marcou
        });
    }

    return transactions;
}
