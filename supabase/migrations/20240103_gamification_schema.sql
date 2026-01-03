-- Migration: 20240103_gamification_schema.sql
-- Description: Add Gamification columns to Profiles table

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_date TIMESTAMP WITH TIME ZONE;
