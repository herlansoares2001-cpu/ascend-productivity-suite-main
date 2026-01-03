-- Security Audit: Ensure RLS on tasks and habits

-- Tasks RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can only manage their own tasks') THEN
    CREATE POLICY "Users can only manage their own tasks" ON tasks
    FOR ALL
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Habits RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habits' AND policyname = 'Users can only manage their own habits') THEN
    CREATE POLICY "Users can only manage their own habits" ON habits
    FOR ALL
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Habit Completions RLS
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habit_completions' AND policyname = 'Users can only manage their own completions') THEN
    CREATE POLICY "Users can only manage their own completions" ON habit_completions
    FOR ALL
    USING (auth.uid() = user_id);
  END IF;
END $$;
