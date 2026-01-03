import { describe, it, expect } from 'vitest';
import { agruparTransacoesPorFatura } from './credit-card-engine';
import { getDashboardSummary } from './dashboard-engine';
import { CreditCard, CardBrand, Transaction as CreditCardTransaction } from '@/types/credit-card';
import { Transaction, Account } from '@/types/finance';

describe('Finance Engines', () => {
    describe('Credit Card Invoice Logic', () => {
        const mockCard: CreditCard = {
            id: 'card-1',
            nome: 'Test Card',
            bandeira: CardBrand.MASTERCARD,
            limite_total: 1000,
            dia_fechamento: 5,
            dia_vencimento: 12,
            cor_hex: '#000',
            user_id: 'user-1',
            created_at: '',
            updated_at: ''
        };

        it('should correctly assign transaction to current invoice (before closing day)', () => {
            const txs: CreditCardTransaction[] = [{
                id: 'tx-1',
                card_id: 'card-1',
                valor: 100,
                data_transacao: '2026-01-04T10:00:00Z', // Before closing day (5th)
                descricao: 'Grocery',
                categoria_id: 'food',
                is_installment: false,
                user_id: 'user-1',
                created_at: '',
                updated_at: ''
            }];

            const invoices = agruparTransacoesPorFatura(txs, mockCard);
            const currentInvoice = invoices.find(inv => inv.mes_referencia === 1 && inv.ano_referencia === 2026);

            expect(currentInvoice?.total).toBe(100);
        });

        it('should move transaction to next invoice (after closing day)', () => {
            const txs: CreditCardTransaction[] = [{
                id: 'tx-2',
                card_id: 'card-1',
                valor: 200,
                data_transacao: '2026-01-06T10:00:00Z', // After closing day (5th)
                descricao: 'Electronics',
                categoria_id: 'shopping',
                is_installment: false,
                user_id: 'user-1',
                created_at: '',
                updated_at: ''
            }];

            const invoices = agruparTransacoesPorFatura(txs, mockCard);
            // Referência 2026-01 should be empty for this transaction
            const janInvoice = invoices.find(inv => inv.mes_referencia === 1 && inv.ano_referencia === 2026);
            // Referência 2026-02 should have the transaction
            const febInvoice = invoices.find(inv => inv.mes_referencia === 2 && inv.ano_referencia === 2026);

            expect(janInvoice?.total || 0).toBe(0);
            expect(febInvoice?.total).toBe(200);
        });
    });

    describe('Balance Projection Logic', () => {
        const mockAccounts: Account[] = [{
            id: 'acc-1',
            name: 'Bank',
            type: 'checking',
            current_balance: 1000,
            color: '#fff',
            user_id: 'user-1',
            created_at: '',
            updated_at: '',
            include_in_dashboard: true,
            is_archived: false
        }];

        const mockDate = new Date('2026-01-10');

        it('should calculate projected balance correctly (Balance + Pending Income - Pending Expense)', () => {
            const transactions: Transaction[] = [
                {
                    id: 't1',
                    description: 'Salary',
                    amount: 5000,
                    type: 'income',
                    status: 'pending',
                    transaction_date: '2026-01-15',
                    user_id: 'user-1',
                    category: 'work',
                    created_at: ''
                },
                {
                    id: 't2',
                    description: 'Rent',
                    amount: 2000,
                    type: 'expense',
                    status: 'pending',
                    transaction_date: '2026-01-20',
                    user_id: 'user-1',
                    category: 'home',
                    created_at: ''
                },
                {
                    id: 't3',
                    description: 'Gym',
                    amount: 100,
                    type: 'expense',
                    status: 'paid', // Already paid, should not affect projection
                    transaction_date: '2026-01-05',
                    user_id: 'user-1',
                    category: 'health',
                    created_at: ''
                }
            ];

            const summary = getDashboardSummary(transactions, mockAccounts, [], [], mockDate);

            // Expected: 1000 (current) + 5000 (pending income) - 2000 (pending expense) = 4000
            expect(summary.totals.balance).toBe(1000);
            expect(summary.totals.projectedBalance).toBe(4000);
        });
    });
});
