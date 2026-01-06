-- Database Trigger para limitar Hábitos via Backend
-- Isso protege contra chamadas diretas de API que pulem a verificação do frontend

-- 1. Função que valida a inserção
CREATE OR REPLACE FUNCTION check_habit_limits()
RETURNS TRIGGER AS $$
DECLARE
    user_tier text;
    current_count int;
    max_allowed int;
BEGIN
    -- Busca o plano do usuário, default 'free' se nulo
    SELECT COALESCE(subscription_tier, 'free') INTO user_tier FROM profiles WHERE id = auth.uid();
    
    -- Define limite baseado no plano (Sincronizado com src/config/plans.ts)
    CASE 
        WHEN user_tier = 'standard' THEN max_allowed := 20;
        WHEN user_tier = 'premium' THEN max_allowed := 9999;
        ELSE max_allowed := 3; -- Free
    END CASE;

    -- Conta quantos hábitos o usuário já tem
    SELECT count(*) INTO current_count FROM habits WHERE user_id = auth.uid();

    -- Se já atingiu ou passou, BLOQUEIA
    -- Nota: Usamos >= porque a inserção aconteceria em seguida, somando +1
    IF current_count >= max_allowed THEN
        RAISE EXCEPTION 'Limite de hábitos atingido para o plano % (Máximo: %)', user_tier, max_allowed;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger que dispara ANTES de cada Insert na tabela 'habits'
DROP TRIGGER IF EXISTS enforce_habit_limits ON habits;
CREATE TRIGGER enforce_habit_limits
BEFORE INSERT ON habits
FOR EACH ROW
EXECUTE FUNCTION check_habit_limits();

-- Repetir lógica para Streaks (se tabela existir)
-- Assumindo que a tabela seja 'streaks' ou similar
-- CREATE OR REPLACE FUNCTION check_streak_limits() ...
