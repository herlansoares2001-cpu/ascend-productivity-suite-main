-- Create a function to clear all user data
-- This function deletes all data belonging to the calling user across all major tables
-- ensuring a complete reset of the account state without deleting the account itself.

CREATE OR REPLACE FUNCTION public.reset_user_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();

  -- Verify if user is logged in
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be logged in to reset data.';
  END IF;

  -- 1. DELETE PRODUCTIVITY DATA
  -- Tasks, Notes, Reminders
  DELETE FROM public.tasks WHERE user_id = current_user_id;
  DELETE FROM public.notes WHERE user_id = current_user_id;
  DELETE FROM public.reminders WHERE user_id = current_user_id;

  -- 2. DELETE FINANCIAL DATA
  -- Transactions, Credit Cards, Accounts
  -- Note: Transactions usually cascade from accounts/cards, but we delete them explicitly just in case they are orphaned or linked differently
  DELETE FROM public.transactions WHERE user_id = current_user_id;
  DELETE FROM public.credit_cards WHERE user_id = current_user_id;
  DELETE FROM public.accounts WHERE user_id = current_user_id;

  -- 3. DELETE HABITS & STREAKS
  -- Habit completetions cascade from habits
  DELETE FROM public.habits WHERE user_id = current_user_id;
  DELETE FROM public.streaks WHERE user_id = current_user_id;

  -- 4. DELETE CALENDAR EVENTS
  DELETE FROM public.events WHERE user_id = current_user_id;

  -- 5. DELETE BOOKS
  DELETE FROM public.books WHERE user_id = current_user_id;

  -- 6. DELETE GOALS (If table exists, future proofing)
  -- Using dynamic SQL to avoid error if table doesn't exist
  BEGIN
    EXECUTE 'DELETE FROM public.goals WHERE user_id = $1' USING current_user_id;
  EXCEPTION WHEN undefined_table THEN
    -- Ignore if table doesn't exist
    NULL;
  END;

END;
$$;
