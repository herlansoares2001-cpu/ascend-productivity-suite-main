-- Migration: 20240105_performance_tuning.sql
-- Description: Add indices for high-frequency queries in Dashboard and Finances.

-- 1. Transactions Indices
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);

-- 2. Habits Indices
CREATE INDEX IF NOT EXISTS idx_habits_user_created ON public.habits(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_habit_completions_composite ON public.habit_completions(user_id, habit_id, completed_at);

-- 3. Credit Cards Indices
CREATE INDEX IF NOT EXISTS idx_credit_cards_user ON public.credit_cards(user_id);

-- 4. Accounts Indices
CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts(user_id);
