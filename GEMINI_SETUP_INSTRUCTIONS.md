# Configuração da API Gemini para o AI Copilot

Para que o chat com a IA funcione, você precisa configurar a API Key do Google Gemini no Supabase.

## Passo 1: Obter a API Key do Google Gemini

1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Clique em **"Get API Key"** ou **"Create API Key"**
3. Copie a API Key gerada (começa com `AIza...`)

## Passo 2: Configurar no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto: `ascend-productivity-suite`
3. No menu lateral, vá em **Project Settings** (ícone de engrenagem)
4. Clique em **Edge Functions**
5. Na seção **"Secrets"** ou **"Environment Variables"**, clique em **"Add new secret"**
6. Configure o seguinte:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Cole a API Key que você copiou no Passo 1
7. Clique em **Save**

## Passo 3: Deploy da Edge Function

Agora você precisa fazer o deploy da Edge Function `ai-copilot` no Supabase:

### Opção A: Deploy via CLI (Recomendado)

```bash
# 1. Instale o Supabase CLI (se ainda não tiver)
npm install -g supabase

# 2. Faça login no Supabase
supabase login

# 3. Link o projeto
supabase link --project-ref ahubncrfcdxsqrloqaeb

# 4. Deploy da função
supabase functions deploy ai-copilot
```

### Opção B: Deploy Manual via Dashboard

1. No Supabase Dashboard, vá em **Edge Functions**
2. Clique em **"Create a new function"**
3. Nome: `ai-copilot`
4. Cole o conteúdo do arquivo `supabase/functions/ai-copilot/index.ts`
5. Clique em **Deploy**

## Passo 4: Testar a IA

1. Abra a aplicação: http://localhost:8080
2. Faça login com sua conta
3. Clique no botão da IA (ícone de brilhos) no centro da barra de navegação inferior
4. Digite uma mensagem: "Como estão as minhas finanças?"
5. A IA deve responder com base nos seus dados reais

## Verificar se está funcionando

Se aparecer um erro ao enviar mensagem, verifique:

1. **No Console do Navegador (F12):**
   - Procure por erros relacionados a "GEMINI_API_KEY"
   - Procure por erros 401 ou 403

2. **No Supabase Dashboard:**
   - Vá em **Edge Functions** > **ai-copilot** > **Logs**
   - Verifique se há erros de autenticação

## Troubleshooting

### Erro: "Configuração de API Key (Gemini) ausente no servidor"
- A API Key não foi configurada no Supabase
- Repita o Passo 2

### Erro: "Edge Function not found"
- A função não foi deployada
- Execute o deploy conforme Passo 3

### Erro: Invalid API Key
- A API Key está incorreta
- Gere uma nova no Google AI Studio e atualize no Supabase

## Referências

- [Google AI Studio](https://aistudio.google.com/app/apikey)
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
