-- Migration: 20240105_create_streaks.sql
-- Description: Creates table for habit streaks (counters) with history tracking

-- 1. Create Table
CREATE TABLE IF NOT EXISTS public.habit_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('quit_bad_habit', 'maintain_good_habit')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, -- Data original do início do compromisso
  last_relapse_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, -- Data da última recaída (usada para calcular o counter atual)
  longest_streak_seconds BIGINT DEFAULT 0, -- Recorde em segundos
  reset_history JSONB DEFAULT '[]'::jsonb, -- Array de objetos: [{ date: '...', reason: '...' }]
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Enable Security (RLS)
ALTER TABLE public.habit_streaks ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DO $$ 
BEGIN
    -- Select
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'habit_streaks' AND policyname = 'Users can view own streaks') THEN
        CREATE POLICY "Users can view own streaks" ON public.habit_streaks FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Insert
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'habit_streaks' AND policyname = 'Users can insert own streaks') THEN
        CREATE POLICY "Users can insert own streaks" ON public.habit_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Update
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'habit_streaks' AND policyname = 'Users can update own streaks') THEN
        CREATE POLICY "Users can update own streaks" ON public.habit_streaks FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Delete
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'habit_streaks' AND policyname = 'Users can delete own streaks') THEN
        CREATE POLICY "Users can delete own streaks" ON public.habit_streaks FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Force schema reload to update API
NOTIFY pgrst, 'reload schema';
