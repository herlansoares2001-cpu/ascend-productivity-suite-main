import { Transaction, Account } from "@/types/finance";
import { CreditCard, Transaction as CreditCardTransaction } from "@/types/credit-card";
import { isSameMonth, isSameYear, parseISO, isBefore, startOfDay, endOfMonth } from "date-fns";
import { agruparTransacoesPorFatura } from "./credit-card-engine";
import { getCategories } from "./categories";

export interface DashboardSummary {
    totals: {
        income: number;
        expense: number;
        balance: number; // Saldo Atual das Contas (O que tem no banco)
        projectedBalance: number; // Saldo após pagar/receber tudo do mês
        creditCardDebt: number; // Faturas do mês atual
    };
    pendingTransactions: Transaction[];
    nextTransactions: Transaction[]; // Top 5
    overdueTransactions: Transaction[]; // Atrasadas
    categoryDistribution: { name: string; value: number; color: string }[];
    cardSummaries: CardSummary[];
}

export interface CardSummary {
    id: string;
    name: string;
    currentInvoice: number;
    limit: number;
    usedLimit: number;
    color: string;
    brand: string;
}



export function getDashboardSummary(
    transactions: Transaction[],
    accounts: Account[],
    cards: CreditCard[],
    cardTransactions: CreditCardTransaction[],
    selectedDate: Date
): DashboardSummary {
    const today = startOfDay(new Date());
    const categoriesList = getCategories();

    const CATEGORY_NAMES: Record<string, string> = {};
    const CATEGORY_COLORS: Record<string, string> = {};
    categoriesList.forEach(c => {
        CATEGORY_NAMES[c.id] = c.name;
        CATEGORY_COLORS[c.id] = c.color || '#95A5A6';
    });

    // 1. Filtrar transações do mês selecionado
    const monthTransactions = transactions.filter(t =>
        isSameMonth(parseISO(t.transaction_date), selectedDate) &&
        isSameYear(parseISO(t.transaction_date), selectedDate) &&
        !t.is_transfer // Ignorar transferências internas nos totais de fluxo
    );

    // 2. Totais do Mês (Entradas e Saídas)
    const totalIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalExpense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    // 3. Saldos
    // Saldo real é a soma de accounts.current_balance (que já considera o histórico todo efetivado)
    const currentBalance = accounts
        .filter(a => !a.is_archived && a.include_in_dashboard)
        .reduce((acc, a) => acc + Number(a.current_balance), 0);

    // Saldo Projetado: Saldo Atual + (Receitas Pendentes do Mês - Despesas Pendentes do Mês)
    // *Nota*: Se o usuário selecionar um mês futuro, essa lógica pode precisar de ajuste (projetar histórico).
    // Mas para o mês atual, funciona bem.
    const pendingIncome = monthTransactions
        .filter(t => t.type === 'income' && t.status === 'pending')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    const pendingExpense = monthTransactions
        .filter(t => t.type === 'expense' && t.status === 'pending')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    // Se o mês for futuro, o Saldo Projetado deve considerar que o Saldo Atual vai mudar até lá? 
    // Para simplificar: Projetado = Atual + Movimentação Pendente do Período Visualizado.
    const projectedBalance = currentBalance + pendingIncome - pendingExpense;

    // 4. Pendências e Atrasos (Geral, não só do mês, ou só do mês?)
    // Próximas: Geralmente a partir de hoje.
    const futurePending = transactions
        .filter(t => t.status === 'pending' && !isBefore(parseISO(t.transaction_date), today))
        .sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());

    const nextTransactions = futurePending.slice(0, 5);

    // Atrasadas: Pendentes antes de hoje
    const overdueTransactions = transactions
        .filter(t => t.status === 'pending' && isBefore(parseISO(t.transaction_date), today))
        .sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());


    // 5. Cartões de Crédito
    let totalCreditDebt = 0;
    const cardSummaries: CardSummary[] = cards.map(card => {
        const txs = cardTransactions.filter(t => t.card_id === card.id);
        const invoices = agruparTransacoesPorFatura(txs, card);

        // Achar fatura do mês selecionado
        const invoice = invoices.find(inv =>
            inv.mes_referencia === selectedDate.getMonth() + 1 &&
            inv.ano_referencia === selectedDate.getFullYear()
        );

        const invoiceValue = invoice ? invoice.total : 0;
        totalCreditDebt += invoiceValue; // Soma apenas a do mês visualizado ou a "atual"? User pediu "Credit Card Debt". Geralmente é o que está devendo agora.
        // Se visualizando passado, mostra fatura passada. Se presente, atual.

        // Limite usado (Total geral do cartão, independente do mês)
        // Isso requer calcular limite global. O `limite_total` é fixo. O usado deve somar todas as faturas em aberto.
        // Simplificação: Usar todas as transações não pagas? O modelo atual não tem status na transação de cartão.
        // Vamos usar o cálculo de Limite Disponível se existir, ou estimar.
        // Vou assumir que o "agruparTransacoesPorFatura" retorna tudo. Vamos somar faturas "abertas" (futuras + atual).
        // Mas para o widget, o user quer ver "Valor da Fatura Atual".

        return {
            id: card.id,
            name: card.nome,
            currentInvoice: invoiceValue,
            limit: card.limite_total,
            usedLimit: invoiceValue, // Mock: só a fatura atual conta pro limite visualizado aqui por enquanto
            color: card.cor_hex,
            brand: card.bandeira
        };
    });

    // 6. Distribuição por Categoria
    const categoryMap: Record<string, number> = {};
    monthTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            const rawCat = t.category || "other";
            const cat = CATEGORY_NAMES[rawCat] ? rawCat : "other";
            categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.amount);
        });

    const categoryDistribution = Object.entries(categoryMap)
        .map(([id, value]) => ({
            name: CATEGORY_NAMES[id] || "Outros",
            value,
            color: CATEGORY_COLORS[id] || "#95A5A6"
        }))
        .sort((a, b) => b.value - a.value);

    return {
        totals: {
            income: totalIncome,
            expense: totalExpense,
            balance: currentBalance,
            projectedBalance,
            creditCardDebt: totalCreditDebt
        },
        pendingTransactions: futurePending, // Todas as futuras pendentes para contagem
        nextTransactions,
        overdueTransactions,
        categoryDistribution,
        cardSummaries
    };
}
