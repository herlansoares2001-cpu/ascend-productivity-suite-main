-- Migration: create_get_finance_summary.sql
CREATE OR REPLACE FUNCTION get_finance_summary(p_user_id UUID)
RETURNS TABLE (
  spent_today NUMERIC,
  spent_month NUMERIC,
  spent_last_month NUMERIC,
  income_month NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_month TIMESTAMP;
  v_start_last_month TIMESTAMP;
  v_end_last_month TIMESTAMP;
  v_today DATE;
BEGIN
  v_today := CURRENT_DATE;
  v_start_month := date_trunc('month', now());
  v_start_last_month := date_trunc('month', now() - interval '1 month');
  v_end_last_month := date_trunc('month', now());
  
  RETURN QUERY
  SELECT
    -- Spent Today
    COALESCE(SUM(CASE WHEN type = 'expense' AND transaction_date::date = v_today THEN amount ELSE 0 END), 0) as spent_today,
    -- Spent Month
    COALESCE(SUM(CASE WHEN type = 'expense' AND transaction_date >= v_start_month THEN amount ELSE 0 END), 0) as spent_month,
    -- Spent Last Month
    COALESCE(SUM(CASE WHEN type = 'expense' AND transaction_date >= v_start_last_month AND transaction_date < v_end_last_month THEN amount ELSE 0 END), 0) as spent_last_month,
    -- Income Month
    COALESCE(SUM(CASE WHEN type = 'income' AND transaction_date >= v_start_month THEN amount ELSE 0 END), 0) as income_month
  FROM transactions
  WHERE user_id = p_user_id;
END;
$$;
