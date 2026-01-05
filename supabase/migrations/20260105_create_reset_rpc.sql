-- Criação da função segura de reset (VERSÃO CORRIGIDA - TABELA HABIT_STREAKS)
CREATE OR REPLACE FUNCTION reset_account()
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

  -- 1. Apagar tabelas dependentes
  DELETE FROM public.habit_completions WHERE user_id = v_user_id;

  BEGIN
    DELETE FROM public.transaction_items WHERE user_id = v_user_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;
  
  -- CORREÇÃO: Tabela correta é 'habit_streaks', não 'streaks'
  DELETE FROM public.habit_streaks WHERE user_id = v_user_id;
  
  -- 2. Apagar tabelas principais
  DELETE FROM public.tasks WHERE user_id = v_user_id;
  DELETE FROM public.notes WHERE user_id = v_user_id;
  DELETE FROM public.reminders WHERE user_id = v_user_id;
  
  BEGIN
      DELETE FROM public.events WHERE user_id = v_user_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;
  
  BEGIN
    DELETE FROM public.books WHERE user_id = v_user_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;
  
  BEGIN
    DELETE FROM public.goals WHERE user_id = v_user_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  -- 3. Finanças e Hábitos
  DELETE FROM public.transactions WHERE user_id = v_user_id;
  DELETE FROM public.habits WHERE user_id = v_user_id;
  
  DELETE FROM public.credit_cards WHERE user_id = v_user_id;
  DELETE FROM public.accounts WHERE user_id = v_user_id;

  -- 4. Resetar Perfil
  UPDATE public.profiles 
  SET 
    level = 1,
    current_xp = 0
  WHERE id = v_user_id;

END;
$$;
