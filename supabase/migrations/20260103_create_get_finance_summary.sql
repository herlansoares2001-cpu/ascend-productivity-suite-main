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
  v_today DATE := CURRENT_DATE;
  v_start_month TIMESTAMP := date_trunc('month', now());
  v_start_last_month TIMESTAMP := date_trunc('month', now() - interval '1 month');
  v_end_last_month TIMESTAMP := date_trunc('month', now());
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN type = 'expense' AND transaction_date = v_today THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'expense' AND transaction_date >= v_start_month::date THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'expense' AND transaction_date >= v_start_last_month::date AND transaction_date < v_end_last_month::date THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'income' AND transaction_date >= v_start_month::date THEN amount ELSE 0 END), 0)
  FROM transactions
  WHERE user_id = p_user_id;
END;
$$;
