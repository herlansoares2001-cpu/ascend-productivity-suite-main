-- Add new columns to profiles for better user analytics
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS main_goal TEXT;

-- Update the handle_new_user function to map these new fields from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    occupation,
    age,
    main_goal
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'occupation',
    (NEW.raw_user_meta_data ->> 'age')::INTEGER,
    NEW.raw_user_meta_data ->> 'main_goal'
  );
  
  -- Create a default quick note for new users
  INSERT INTO public.notes (user_id, content, is_quick_note)
  VALUES (NEW.id, 'Bem-vindo ao Ascend! Comece definindo suas metas.', true);
  
  RETURN NEW;
END;
$$;
