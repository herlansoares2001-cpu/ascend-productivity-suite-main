# Configuração do Google Agenda (OAuth)

O erro `Unsupported provider: provider is not enabled` indica que o login social com Google não está ativado no seu projeto Supabase.

## Passo 1: Google Cloud Console
1. Acesse [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um novo projeto (ex: `Ascend App`).
3. Vá em **APIs & Services > Library** e ative a **Google Calendar API**.
4. Vá em **APIs & Services > OAuth consent screen**:
   - Tipo: External.
   - Preencha App Name e Emails.
   - **Scopes**: Adicione `.../auth/calendar.events` e `.../auth/calendar.readonly`.
5. Vá em **APIs & Services > Credentials**:
   - Create Credentials > OAuth Client ID.
   - Application type: **Web application**.
   - **Authorized redirect URIs**: Você precisará da URL de Callback do Supabase (veja passo 2).
   - Copie o **Client ID** e **Client Secret**.

## Passo 2: Supabase Dashboard
1. Acesse o dashboard do seu projeto Supabase.
2. Vá em **Authentication > Providers**.
3. Selecione **Google**.
4. Ative o toggle **Enable Google provider**.
5. Cole o **Client ID** e **Client Secret** obtidos no passo anterior.
6. Copie a **Callback URL** (ex: `https://xyz.supabase.co/auth/v1/callback`) mostrada nesta tela.
7. Volte ao Google Cloud Console e adicione essa URL em "Authorized redirect URIs".
8. Salve em ambos os lugares.

## Passo 3: Teste
Recarregue a aplicação e tente clicar em "Conectar" novamente.
