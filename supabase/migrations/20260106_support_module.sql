-- Tabela de Chamados de Suporte
CREATE TABLE IF NOT EXISTS support_tickets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Habilitar segurança (RLS)
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
-- 1. Usuário pode criar tickets
CREATE POLICY "Users can create tickets" 
ON support_tickets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Usuário pode ver apenas seus próprios tickets
CREATE POLICY "Users can view own tickets" 
ON support_tickets FOR SELECT 
USING (auth.uid() = user_id);

-- (Opcional) Index para performance
CREATE INDEX IF NOT EXISTS support_tickets_user_id_idx ON support_tickets(user_id);
