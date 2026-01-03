# 🏗️ Refatoração Arquitetural - Ascend Productivity Suite

## 📋 Objetivo
Refatorar o projeto para melhorar:
- **Arquitetura**: Separação clara de responsabilidades
- **Performance**: Mover cálculos pesados para o banco de dados
- **Manutenibilidade**: Estrutura de pastas profissional

---

## 🎯 FASE 1: REESTRUTURAÇÃO DE PASTAS

### Estrutura Atual (src/lib)
```
src/lib/
├── account-engine.ts (3.6KB)
├── ai-context.ts (3.8KB)
├── badges.ts (3KB)
├── canvas-utils.ts (1.8KB)
├── categories.ts (1.7KB)
├── credit-card-engine.ts (7.8KB)
├── dashboard-engine.ts (7.1KB) ⚠️ PERFORMANCE CRÍTICO
├── event-storage.ts (2.9KB)
├── forecasting-engine.ts (7KB)
├── habit-storage.ts (4.1KB)
├── settings-storage.ts (2KB)
├── transaction-engine.ts (3.2KB)
└── utils.ts (169B)
```

### Estrutura Proposta (Nova)
```
src/
├── core/                       # Lógica de negócios pura
│   ├── finance/
│   │   ├── account.engine.ts
│   │   ├── credit-card.engine.ts
│   │   ├── transaction.engine.ts
│   │   ├── forecasting.engine.ts
│   │   └── categories.ts
│   ├── habits/
│   │   └── badges.ts
│   ├── calendar/
│   │   └── canvas-utils.ts
│   └── utils/
│       └── index.ts
│
├── services/                   # Chamadas de API/DB
│   ├── supabase/
│   │   ├── finance.service.ts     # get_dashboard_summary RPC
│   │   ├── habits.service.ts
│   │   ├── events.service.ts
│   │   └── settings.service.ts
│   └── ai/
│       └── context.service.ts     # ai-context
│
└── storage/                     # LocalStorage/SessionStorage
    ├── event.storage.ts
    ├── habit.storage.ts
    └── settings.storage.ts
```

---

## 🚀 FASE 2: OTIMIZAÇÃO DE PERFORMANCE (DATABASE)

### Problema Identificado
**Arquivo:** `dashboard-engine.ts` (169 linhas)
- Faz múltiplos `.filter()` e `.reduce()` no cliente
- Processa TODAS as transações em memória
- Cálculos complexos de faturas de cartão
- Com 10.000+ transações → LAG significativo

### Solução: PostgreSQL RPC Function
Criar `get_dashboard_summary(p_user_id UUID, p_month INT, p_year INT)`

**Retorna:**
```sql
{
  "totals": {
    "income": 5000.00,
    "expense": 3500.00,
    "balance": 12000.00,
    "projected_balance": 13500.00,
    "credit_card_debt": 2000.00
  },
  "pending_count": 5,
  "overdue_count": 2,
  "category_distribution": [...]
}
```

**Benefícios:**
- ✅ Indexação automática do Postgres
- ✅ Processamento paralelo no servidor
- ✅ Redução de tráfego de rede (80%)
- ✅ Cache mais eficiente

---

## 🧹 FASE 3: LIMPEZA DE SCHEMA

### Redundância Detectada: `transactions` table

**Problema:**
- Coluna `is_paid` (BOOLEAN)
- Coluna `status` (TEXT: 'paid' | 'pending')

**Decisão Arquitetural:**
1. **Manter:** `is_paid` (BOOLEAN) → normalizado e indexável
2. **Remover:** `status` (TEXT) → redundante
3. **Criar:** VIEW `transactions_with_status` para compatibilidade frontend

```sql
CREATE OR REPLACE VIEW transactions_with_status AS
SELECT 
  *,
  CASE WHEN is_paid THEN 'paid' ELSE 'pending' END AS status
FROM transactions;
```

**Migração Segura:**
- Step 1: Criar VIEW
- Step 2: Atualizar queries do frontend para usar VIEW
- Step 3: DROP coluna `status` (após testes)

---

## 📅 Cronograma de Execução
- [ ] FASE 1: Reestruturação de pastas (30min)
- [ ] FASE 2: Migration SQL + RPC (45min)
- [ ] FASE 3: Limpeza de schema (20min)
- [ ] FASE 4: Testes e validação (15min)

**Total estimado:** 2 horas

---

## ✅ Checklist de Validação
- [ ] Todos os imports atualizados
- [ ] Build sem erros (`npm run build`)
- [ ] Testes de integração passando
- [ ] Performance melhorou (medição antes/depois)
- [ ] Documentação atualizada
