-- Migration: 20240104_fix_inserts.sql
-- Description: Add default auth.uid() to user_id columns and ensure INSERT policies exist for robustness.

-- 1. Set Default User ID
ALTER TABLE public.accounts ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.credit_cards ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.habits ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.transactions ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 2. Ensure INSERT Policies (Re-applying to be safe)

-- Accounts
DROP POLICY IF EXISTS "Users can insert their own accounts" ON public.accounts;
CREATE POLICY "Users can insert their own accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Credit Cards
DROP POLICY IF EXISTS "Users can insert their own cards" ON public.credit_cards;
CREATE POLICY "Users can insert their own cards" ON public.credit_cards FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Habits
DROP POLICY IF EXISTS "Users can create own habits" ON public.habits;
CREATE POLICY "Users can create own habits" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;
CREATE POLICY "Users can create own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
