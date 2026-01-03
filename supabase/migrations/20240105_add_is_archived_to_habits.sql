-- Migration: 20240105_add_is_archived_to_habits.sql
-- Description: Add missing 'is_archived' column to habits table

ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Force schema reload
NOTIFY pgrst, 'reload schema';
