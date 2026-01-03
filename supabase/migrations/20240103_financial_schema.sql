-- Migration: 20240103_financial_schema.sql
-- Description: Create Accounts, Credit Cards tables and update Transactions for Full Backend support.

-- 1. Create Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('checking', 'savings', 'investment', 'cash', 'other')) NOT NULL,
  initial_balance NUMERIC DEFAULT 0,
  color TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own accounts" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts" ON accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own accounts" ON accounts FOR DELETE USING (auth.uid() = user_id);


-- 2. Create Credit Cards Table
CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  brand TEXT, -- e.g. 'mastercard', 'visa'
  limit_amount NUMERIC DEFAULT 0,
  closing_day INTEGER CHECK (closing_day BETWEEN 1 AND 31),
  due_day INTEGER CHECK (due_day BETWEEN 1 AND 31),
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Credit Cards
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cards" ON credit_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cards" ON credit_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cards" ON credit_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cards" ON credit_cards FOR DELETE USING (auth.uid() = user_id);


-- 3. Update Transactions Table
-- We add columns to replace LocalStorage logic
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id),
ADD COLUMN IF NOT EXISTS card_id UUID REFERENCES credit_cards(id),
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS installment_group_id UUID,
ADD COLUMN IF NOT EXISTS installment_number INTEGER,
ADD COLUMN IF NOT EXISTS total_installments INTEGER,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
