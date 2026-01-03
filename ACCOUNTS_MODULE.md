# Módulo de Gestão de Contas Bancárias

Este documento descreve a implementação do módulo de contas bancárias no Ascend Productivity Suite.

## Visão Geral
O módulo permite gerenciar múltiplas contas financeiras (corrente, poupança, dinheiro, investimentos), realizar transferências entre elas e visualizar o saldo projetado com base nas transações registradas.

## Arquitetura de Dados

### Contas (`Account`)
Atualmente, as contas são gerenciadas primariamente no frontend via estado local (`useState`), inicializadas com um conjunto de dados mockados (`MOCK_ACCOUNTS`). 

**Campos Principais:**
- `id`: Identificador único
- `name`: Nome da conta
- `type`: Tipo (checking, savings, investment, cash, other)
- `initial_balance`: Saldo inicial
- `current_balance`: Saldo calculado dinamicamente
- `include_in_dashboard`: Se o saldo compõe o total geral

### Integração com Transações
Devido a limitações no esquema atual do banco de dados Supabase (ausência da coluna `account_id` na tabela `transactions`), implementamos uma estratégia híbrida para persistência:

1. **Storage Local (Workaround):**
   - Utilizamos `localStorage` para manter um mapeamento entre `transaction_id` e `account_id`.
   - Chave: `transaction_accounts`
   - Formato: `{ "uuid-transacao": "uuid-conta" }`

2. **Cálculo de Saldo:**
   - O saldo atual é calculado em tempo real somando o `initial_balance` com todas as receitas e subtraindo as despesas vinculadas à conta através do mapeamento acima.

## Funcionalidades Implementadas

### 1. Listagem e Gestão
- Visualização de todas as contas com saldo atualizado.
- Toggle para alternar entre "Saldo Atual" (considera transações até hoje) e "Saldo Projetado" (considera futuro).
- Opções para Editar e Arquivar contas.

### 2. Criação de Contas
- Interface para adicionar novas contas com personalização de cor e ícone automático baseado no tipo.
- *Nota: Novas contas são persistidas apenas na memória da sessão atual.*

### 3. Transferências
- Funcionalidade completa de transferência entre contas.
- Gera automaticamente duas transações:
  1. **Despesa** na conta de origem (Categoria: Transfer).
  2. **Receita** na conta de destino (Categoria: Transfer).
- Garante integridade do saldo total.

## Componentes Chave

- `src/pages/Finances.tsx`: Controlador principal e integrador da lógica.
- `src/components/accounts/AccountsList.tsx`: Lista visual das contas.
- `src/components/accounts/AccountFormDialog.tsx`: Formulário de criação/edição.
- `src/components/accounts/TransferDialog.tsx`: Assistente de transferência.
- `src/lib/account-engine.ts`: Lógica de negócios e cálculos financeiros.

## Próximos Passos (Recomendado)

Para garantir robustez total e persistência entre dispositivos, recomenda-se a seguinte migração de banco de dados:

1. Criar tabela `accounts` no Supabase.
2. Adicionar coluna `account_id` (Foreign Key) na tabela `transactions`.
3. Migrar o mapeamento do `localStorage` para o banco de dados.
4. Atualizar o hook `useTransactions` para fazer o join nativo.
