-- Create a secure RPC to allow users to delete their own account
-- This function runs with SECURITY DEFINER privileges to allow deletion from auth.users
-- This will trigger ON DELETE CASCADE for all foreign keys (profiles, habits, etc.)

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the user from the auth system.
  -- Due to ON DELETE CASCADE constraints in public tables (defined in base_schema),
  -- this will automatically remove all associated user data in public.profiles, public.habits, etc.
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;
