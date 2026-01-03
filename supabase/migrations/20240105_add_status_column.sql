-- Migration: 20240105_add_status_column.sql
-- Description: Adds 'status' column to transactions table

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'paid';

-- Force schema reload
NOTIFY pgrst, 'reload schema';
