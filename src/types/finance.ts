export type AccountType = 'checking' | 'savings' | 'cash' | 'investment' | 'other';
export type TransactionStatus = 'pending' | 'paid' | 'overdue' | 'projected';
export type TransactionFrequency = 'weekly' | 'monthly' | 'yearly';

export interface Account {
    id: string;
    user_id: string;
    name: string;
    type: AccountType;
    color: string;
    initial_balance: number;
    current_balance: number; // Calculated field (frontend) or View
    include_in_dashboard: boolean;
    is_archived: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreditCard {
    id: string;
    user_id: string;
    name: string;
    brand: string; // 'visa', 'mastercard', etc.
    limit_amount: number;
    closing_day: number;
    due_day: number;
    color: string;
    created_at?: string;
}

export interface Transaction {
    id: string;
    user_id: string;
    description: string;
    amount: number;
    type: "income" | "expense";
    category: string | null;
    transaction_date: string;
    created_at: string;

    // Account & Card Links (Now DB Columns)
    account_id?: string;
    card_id?: string;

    // Status Flow
    is_paid: boolean;
    status: TransactionStatus; // Derived from is_paid? Or separate? 
    // DB has is_paid boolean. Frontend usually maps this to status 'paid' | 'pending'.
    // I will keep status for compatibility but populate it based on is_paid.

    // Recurrence (Contas Fixas)
    is_recurring: boolean;
    frequency?: TransactionFrequency;
    recurrence_id?: string;

    // Installments (Parcelamento)
    is_installment?: boolean;
    installment_group_id?: string;
    installment_number?: number;
    total_installments?: number;

    // Transfer Logic (Maybe metadata or inferred)
    is_transfer?: boolean;
    transfer_id?: string;
    related_account_id?: string;
}

export const ACCOUNT_TYPES: { id: AccountType; label: string }[] = [
    { id: 'checking', label: 'Conta Corrente' },
    { id: 'savings', label: 'Poupança' },
    { id: 'cash', label: 'Dinheiro' },
    { id: 'investment', label: 'Investimento' },
    { id: 'other', label: 'Outros' },
];
