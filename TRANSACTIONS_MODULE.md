# Módulo Avançado de Transações Financeiras

Este documento descreve a arquitetura do Módulo de Transações implementado em `src/pages/Finances.tsx`, que suporta funcionalidades complexas como Parcelamento, Recorrência e Status (Pendente/Pago) utilizando uma abordagem híbrida (Supabase + LocalStorage).

## 1. Visão Geral

Devido às limitações atuais do esquema do banco de dados (tabela `transactions` simples), implementamos uma camada lógica no frontend que simula recursos de um ERP financeiro completo.

### Funcionalidades
- **Parcelamento Inteligente**: Criação automática de N transações futuras (ex: Compra de R$ 1000 em 10x).
- **Recorrência**: Projeção de lançamentos fixos (ex: Aluguel por 12 meses).
- **Gestão de Status**: Controle de fluxo de caixa (Pendente vs Efetivado).
- **Timeline Agrupada**: Visualização diária das movimentações.

## 2. Arquitetura Híbrida

O sistema utiliza duas fontes de dados simultâneas:

1.  **Supabase (Persistência Base)**:
    - Armazena os dados "brutos" da transação: `amount`, `description`, `date`, `category`.
    - Garante segurança e backup dos dados financeiros essenciais.

2.  **LocalStorage (Metadados Avançados)**:
    - Armazena dados de UI e lógica de negócio que o banco ainda não suporta.
    - **`transaction_meta`**: Mapeia `transaction_id` -> `{ status, is_recurring, installment_number, total_installments }`.
    - **`transaction_accounts`**: Mapeia `transaction_id` -> `account_id` (vínculo com contas bancárias).

### Fluxo de Carregamento (`financeTransactions` Adapter)
Ao carregar as transações, o sistema faz um "Merge" em tempo real:
```javascript
const finalTransaction = {
  ...transactionFromSupabase,
  ...metadataFromLocalStorage, // Adiciona status, installments, etc
  account_id: accountMappingFromLocalStorage
};
```

## 3. Lógica de Criação (`handleCreate`)

Ao criar uma transação complexa (ex: Parcelada em 3x):
1.  O `Transaction Engine` gera 3 objetos de transação com datas incrementadas (Mês 1, 2, 3).
2.  O sistema envia 3 requisições `create` para o Supabase.
3.  O sistema salva os metadados (ex: "1/3", "2/3") no LocalStorage vinculados aos IDs gerados.

## 4. Cálculo de Saldo e Projeção

O sistema separa dois conceitos de saldo:
- **Saldo Atual (Disponível)**: Soma apenas transações com status `paid` (Efetivadas).
- **Saldo Projetado (Futuro)**: Soma TODAS as transações (`paid` + `pending`), permitindo prever o fluxo de caixa futuro.

## 5. Próximos Passos (Migração Backend)

Para tornar essa arquitetura definitiva, o banco de dados deve ser atualizado com:
```sql
ALTER TABLE transactions 
ADD COLUMN status text DEFAULT 'paid',
ADD COLUMN is_recurring boolean DEFAULT false,
ADD COLUMN is_installment boolean DEFAULT false,
ADD COLUMN installment_number integer,
ADD COLUMN total_installments integer,
ADD COLUMN account_id uuid REFERENCES accounts(id);
```
Após essa migração, basta remover o adapter de LocalStorage e ler diretamente do banco.
