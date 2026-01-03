// Credit Card Business Logic Engine

import { CreditCard, Transaction, Invoice, InvoiceStatus, LimiteInfo } from '@/types/credit-card';

/**
 * Algoritmo de Alocação de Fatura
 * Determina a qual fatura (Mês/Ano) uma transação pertence
 * Regra: Se data_transacao >= dia_fechamento, vai para a fatura do próximo mês
 */
export function calcularFaturaDestino(
    data_transacao: Date,
    dia_fechamento: number
): { mes: number; ano: number } {
    const dia_transacao = data_transacao.getDate();
    const mes_transacao = data_transacao.getMonth(); // 0-11
    const ano_transacao = data_transacao.getFullYear();

    // Se a transação ocorreu no dia de fechamento ou depois
    if (dia_transacao >= dia_fechamento) {
        // Vai para a fatura do próximo mês
        const proximaData = new Date(ano_transacao, mes_transacao + 1, 1);
        return {
            mes: proximaData.getMonth() + 1, // 1-12
            ano: proximaData.getFullYear()
        };
    } else {
        // Vai para a fatura do mês atual
        return {
            mes: mes_transacao + 1, // 1-12
            ano: ano_transacao
        };
    }
}

/**
 * Motor de Parcelamento
 * Gera múltiplas transações para compras parceladas
 */
export function gerarTransacoesParceladas(
    transacao_base: Omit<Transaction, 'id' | 'installment_number' | 'created_at' | 'updated_at'>,
    total_parcelas: number
): Omit<Transaction, 'id' | 'created_at' | 'updated_at'>[] {
    const transacoes: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>[] = [];
    const valor_parcela = transacao_base.valor / total_parcelas;
    const data_inicial = new Date(transacao_base.data_transacao);

    for (let i = 0; i < total_parcelas; i++) {
        // Calcula a data da parcela (mês + i)
        const data_parcela = new Date(
            data_inicial.getFullYear(),
            data_inicial.getMonth() + i,
            data_inicial.getDate()
        );

        transacoes.push({
            ...transacao_base,
            valor: valor_parcela,
            data_transacao: data_parcela.toISOString(),
            is_installment: true,
            installment_number: i + 1,
            total_installments: total_parcelas
        });
    }

    return transacoes;
}

/**
 * Cálculo de Limite Disponível
 * Subtrai todas as transações pendentes e parcelas futuras do limite total
 */
export function calcularLimiteDisponivel(
    cartao: CreditCard,
    transacoes: Transaction[]
): LimiteInfo {
    const hoje = new Date();

    // Agrupa transações por fatura
    const transacoesPorFatura = new Map<string, number>();

    transacoes.forEach(transacao => {
        const dataTransacao = new Date(transacao.data_transacao);
        const fatura = calcularFaturaDestino(dataTransacao, cartao.dia_fechamento);
        const chave = `${fatura.ano}-${fatura.mes}`;

        const valorAtual = transacoesPorFatura.get(chave) || 0;
        transacoesPorFatura.set(chave, valorAtual + transacao.valor);
    });

    // Calcula o total usado (todas as faturas abertas e futuras)
    const limite_usado = Array.from(transacoesPorFatura.values()).reduce(
        (acc, valor) => acc + valor,
        0
    );

    const limite_disponivel = cartao.limite_total - limite_usado;
    const percentual_uso = (limite_usado / cartao.limite_total) * 100;

    // Prepara informações das próximas faturas
    const proximas_faturas = Array.from(transacoesPorFatura.entries())
        .map(([chave, valor]) => {
            const [ano, mes] = chave.split('-').map(Number);
            return { mes, ano, valor };
        })
        .sort((a, b) => {
            if (a.ano !== b.ano) return a.ano - b.ano;
            return a.mes - b.mes;
        });

    return {
        limite_total: cartao.limite_total,
        limite_usado,
        limite_disponivel,
        percentual_uso,
        proximas_faturas
    };
}

/**
 * Calcula as datas de fechamento e vencimento de uma fatura
 */
export function calcularDatasInvoice(
    mes: number,
    ano: number,
    dia_fechamento: number,
    dia_vencimento: number
): { data_fechamento: Date; data_vencimento: Date } {
    // Data de fechamento é no mês anterior ao mês de referência
    const data_fechamento = new Date(ano, mes - 2, dia_fechamento);

    // Ajusta se o dia de fechamento não existe no mês
    if (data_fechamento.getMonth() !== mes - 2) {
        data_fechamento.setDate(0); // Último dia do mês anterior
    }

    // Data de vencimento é no mês de referência
    const data_vencimento = new Date(ano, mes - 1, dia_vencimento);

    // Ajusta se o dia de vencimento não existe no mês
    if (data_vencimento.getMonth() !== mes - 1) {
        data_vencimento.setDate(0); // Último dia do mês
    }

    return { data_fechamento, data_vencimento };
}

/**
 * Determina o status de uma fatura baseado nas datas
 */
export function determinarStatusFatura(
    mes: number,
    ano: number,
    dia_fechamento: number,
    dia_vencimento: number,
    paga: boolean = false
): InvoiceStatus {
    if (paga) return InvoiceStatus.PAID;

    const hoje = new Date();
    const { data_fechamento, data_vencimento } = calcularDatasInvoice(
        mes,
        ano,
        dia_fechamento,
        dia_vencimento
    );

    if (hoje > data_vencimento) {
        return InvoiceStatus.OVERDUE;
    } else if (hoje > data_fechamento) {
        return InvoiceStatus.CLOSED;
    } else {
        return InvoiceStatus.OPEN;
    }
}

/**
 * Calcula o melhor dia para compra (dia após o fechamento)
 * Compras neste dia vão para a fatura mais distante
 */
export function calcularMelhorDiaCompra(dia_fechamento: number): {
    dia: number;
    motivo: string;
} {
    const melhor_dia = dia_fechamento + 1;

    return {
        dia: melhor_dia > 31 ? 1 : melhor_dia,
        motivo: `Compras realizadas neste dia vão para a fatura do próximo mês, maximizando o prazo de pagamento.`
    };
}

/**
 * Agrupa transações por fatura
 */
export function agruparTransacoesPorFatura(
    transacoes: Transaction[],
    cartao: CreditCard
): Invoice[] {
    const faturaMap = new Map<string, Transaction[]>();

    transacoes.forEach(transacao => {
        const dataTransacao = new Date(transacao.data_transacao);
        const fatura = calcularFaturaDestino(dataTransacao, cartao.dia_fechamento);
        const chave = `${fatura.ano}-${fatura.mes}`;

        if (!faturaMap.has(chave)) {
            faturaMap.set(chave, []);
        }
        faturaMap.get(chave)!.push(transacao);
    });

    const invoices: Invoice[] = [];

    faturaMap.forEach((transactions, chave) => {
        const [ano, mes] = chave.split('-').map(Number);
        const total = transactions.reduce((acc, t) => acc + t.valor, 0);
        const { data_fechamento, data_vencimento } = calcularDatasInvoice(
            mes,
            ano,
            cartao.dia_fechamento,
            cartao.dia_vencimento
        );

        invoices.push({
            mes_referencia: mes,
            ano_referencia: ano,
            status: determinarStatusFatura(mes, ano, cartao.dia_fechamento, cartao.dia_vencimento),
            card_id: cartao.id,
            transactions,
            total,
            data_fechamento: data_fechamento.toISOString(),
            data_vencimento: data_vencimento.toISOString()
        });
    });

    return invoices.sort((a, b) => {
        if (a.ano_referencia !== b.ano_referencia) {
            return a.ano_referencia - b.ano_referencia;
        }
        return a.mes_referencia - b.mes_referencia;
    });
}
