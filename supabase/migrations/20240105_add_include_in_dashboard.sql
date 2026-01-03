-- Migration: 20240105_add_include_in_dashboard.sql
-- Description: Adds missing column 'include_in_dashboard' to accounts table to fix frontend insert error.

-- 1. Add Column
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS include_in_dashboard BOOLEAN DEFAULT TRUE;

-- 2. Force Refresh Schema Cache (Optional, normally automatic but helps in some cases)
NOTIFY pgrst, 'reload schema';
