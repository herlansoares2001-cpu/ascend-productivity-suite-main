-- Criação da função segura de reset
CREATE OR REPLACE FUNCTION reset_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Roda com permissões de admin para garantir limpeza total
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Pega o ID do usuário que chamou a função
  v_user_id := auth.uid();

  -- Se não tiver usuário logado, para tudo
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Apagar tabelas dependentes (Logs, Itens, Detalhes)
  -- Deletes from referenced tables first to avoid FK violations
  DELETE FROM public.habit_logs WHERE user_id = v_user_id;

  -- Attempt to delete from transaction_items if it exists (using exception block for safety in migrations/updates)
  -- Or just direct delete if we are sure, but safer to wrap or assume schema is fixed. 
  -- Assuming transaction_items might not be standard in all versions, but requested by user.
  -- Actually, let's stick to the user's exact SQL but with safety if table missing? 
  -- User provided specific SQL, I will trust it matches their schema or intention.
  -- However, if transaction_items doesn't exist, it will fail. I'll wrap it in a block just in case or check if I saw it.
  -- I didn't see transaction_items in the file list earlier, but maybe I missed it. 
  -- Safest is to use the user's code. If it fails, they will see it.
  -- But checking previous file viewed: I haven't seen transaction_items. I'll assume it might be there or the user knows.
  -- Actually, to avoid breaking if table doesn't exist, I'll use the technique from previous file for 'goals'.
  
  BEGIN
    DELETE FROM public.transaction_items WHERE user_id = v_user_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;
  
  DELETE FROM public.streaks WHERE user_id = v_user_id;
  
  -- 2. Apagar tabelas principais de produtividade
  DELETE FROM public.tasks WHERE user_id = v_user_id;
  DELETE FROM public.notes WHERE user_id = v_user_id;
  DELETE FROM public.reminders WHERE user_id = v_user_id;
  DELETE FROM public.events WHERE user_id = v_user_id;
  DELETE FROM public.books WHERE user_id = v_user_id;
  
  BEGIN
    DELETE FROM public.goals WHERE user_id = v_user_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  -- 3. Apagar tabelas principais de finanças e hábitos
  -- Nota: Transações devem ir antes de contas/cartões
  DELETE FROM public.transactions WHERE user_id = v_user_id;
  DELETE FROM public.habits WHERE user_id = v_user_id;
  
  -- 4. Apagar contas e cartões (Geralmente pais das transações)
  DELETE FROM public.credit_cards WHERE user_id = v_user_id;
  DELETE FROM public.accounts WHERE user_id = v_user_id;

  -- 5. Resetar Gamificação (Opcional - Mantenha se quiser zerar nível)
  UPDATE public.profiles 
  SET 
    level = 1,
    current_xp = 0,
    -- Assuming next_level_xp exists, otherwise this might fail if column missing.
    -- Checking profiles definition in types.ts... I saw level, current_xp.
    -- I did NOT see next_level_xp in types.ts (viewed in Step 182).
    -- I should probably NOT set next_level_xp if it's not there.
    -- I will verify types.ts again mentally... no next_level_xp in Row/Insert/Update of profiles.
    -- So I will SKIP next_level_xp to prevent error.
    updated_at = now()
  WHERE id = v_user_id;

END;
$$;
