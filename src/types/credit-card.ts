// Credit Card Management Types

export enum CardBrand {
    VISA = 'visa',
    MASTERCARD = 'mastercard',
    ELO = 'elo',
    AMEX = 'amex',
    HIPERCARD = 'hipercard',
    OTHER = 'other'
}

export enum InvoiceStatus {
    OPEN = 'open',
    CLOSED = 'closed',
    PAID = 'paid',
    OVERDUE = 'overdue'
}

export enum TransactionCategory {
    FOOD = 'food',
    TRANSPORT = 'transport',
    SHOPPING = 'shopping',
    ENTERTAINMENT = 'entertainment',
    HEALTH = 'health',
    EDUCATION = 'education',
    BILLS = 'bills',
    OTHER = 'other'
}

export interface CreditCard {
    id: string;
    nome: string;
    bandeira: CardBrand;
    limite_total: number;
    dia_fechamento: number; // 1-31
    dia_vencimento: number; // 1-31
    cor_hex: string;
    created_at: string;
    updated_at: string;
    user_id: string;
}

export interface Transaction {
    id: string;
    card_id: string;
    valor: number;
    data_transacao: string; // ISO date string
    descricao: string;
    categoria_id: TransactionCategory;
    is_installment: boolean;
    installment_number?: number; // Current installment (1-based)
    total_installments?: number; // Total number of installments
    created_at: string;
    updated_at: string;
    user_id: string;
}

export interface Invoice {
    mes_referencia: number; // 1-12
    ano_referencia: number;
    status: InvoiceStatus;
    card_id: string;
    transactions: Transaction[];
    total: number;
    data_fechamento: string; // ISO date string
    data_vencimento: string; // ISO date string
}

export interface InvoicePayment {
    id: string;
    invoice_mes: number;
    invoice_ano: number;
    card_id: string;
    valor_pago: number;
    conta_id: string; // ID da conta corrente
    data_pagamento: string;
    created_at: string;
    user_id: string;
}

export interface LimiteInfo {
    limite_total: number;
    limite_usado: number;
    limite_disponivel: number;
    percentual_uso: number;
    proximas_faturas: {
        mes: number;
        ano: number;
        valor: number;
    }[];
}
