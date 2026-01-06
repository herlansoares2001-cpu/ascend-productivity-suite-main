-- 1. Função de Segurança Centralizada (Protege Habits e Streaks)
CREATE OR REPLACE FUNCTION check_plan_limits()
RETURNS TRIGGER AS $$
DECLARE
    user_tier text;
    current_count int;
    max_allowed int;
    limit_config jsonb;
BEGIN
    -- Busca o plano atual do usuário
    SELECT subscription_tier INTO user_tier 
    FROM profiles 
    WHERE id = auth.uid();

    -- CONFIGURAÇÃO DOS LIMITES (Deve bater com o plans.ts)
    -- Formato: { "habits": limite, "streaks": limite }
    limit_config := CASE 
        WHEN user_tier = 'premium' THEN '{"habits": 9999, "streaks": 9999}'::jsonb
        WHEN user_tier = 'standard' THEN '{"habits": 20, "streaks": 5}'::jsonb
        ELSE '{"habits": 3, "streaks": 1}'::jsonb -- Free
    END;

    -- Define o limite baseado na tabela que está sendo acessada
    IF TG_TABLE_NAME = 'habits' THEN
        max_allowed := (limit_config->>'habits')::int;
    ELSIF TG_TABLE_NAME = 'streaks' THEN
        max_allowed := (limit_config->>'streaks')::int;
    END IF;

    -- Conta quantos itens o usuário já tem
    EXECUTE format('SELECT count(*) FROM %I WHERE user_id = $1', TG_TABLE_NAME)
    INTO current_count
    USING auth.uid();

    -- Bloqueia se atingiu o limite
    -- Nota: Usamos >= porque a inserção aconteceria em seguida, somando +1
    IF current_count >= max_allowed THEN
        RAISE EXCEPTION 'Limite do plano % atingido. Faça upgrade para criar mais.', user_tier;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ativar a proteção nas tabelas (Triggers)

-- Tabela Habits
DROP TRIGGER IF EXISTS enforce_limits_habits ON habits;
CREATE TRIGGER enforce_limits_habits
BEFORE INSERT ON habits
FOR EACH ROW EXECUTE FUNCTION check_plan_limits();

-- Tabela Streaks (Se existir)
-- Remova o comentário se a tabela 'streaks' já existir
-- DROP TRIGGER IF EXISTS enforce_limits_streaks ON streaks;
-- CREATE TRIGGER enforce_limits_streaks
-- BEFORE INSERT ON streaks
-- FOR EACH ROW EXECUTE FUNCTION check_plan_limits();
