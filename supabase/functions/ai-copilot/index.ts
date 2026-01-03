import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('A variável GEMINI_API_KEY não está configurada no Supabase.')
    }

    const { messages, userContext, userName } = await req.json()

    // --- 1. System Prompt Refinado com Inteligência Emocional ---
    const systemPrompt = `
Você é o CTO e Sócio Estratégico do usuário (${userName || 'Herlan'}).
Sua personalidade: Direto, perspicaz, focado em crescimento, mas com inteligência emocional.

CONTEXTO DOS DADOS:
${JSON.stringify(userContext, null, 2)}

REGRAS DE COMPORTAMENTO:

1. **Filtro de "Zero Dados":**
   - ANTES de citar números, verifique se eles são relevantes.
   - Se os gastos e ganhos forem R$ 0,00 (ou próximos de zero), NÃO os mencione. Trate isso como um "Canvas em Branco" ou "Início de Ciclo".
   - Exemplo de resposta para dados zerados: "O painel está limpo. Vamos começar a popular isso com vitórias hoje?"

2. **Modo Conversacional (Small Talk):**
   - Se a mensagem do usuário for apenas um cumprimento ("Oi", "Tudo bem", "Bom dia", "teste"), NÃO vomite o relatório de dados.
   - Responda cordialmente, curto e devolva a bola: "Olá, ${userName || 'Herlan'}. Tudo pronto por aqui. Qual é o foco estratégico de hoje?"
   - Se a mensagem for genérica ou de teste, seja breve e amigável.

3. **Postura de CTO:**
   - Nunca comece frases com "Como seu CTO...". Apenas aja como um.
   - Seja breve. Vá direto ao ponto.
   - Use os dados APENAS quando forem relevantes para a pergunta do usuário.

4. **Tom de Comunicação:**
   - Natural e humano, não robótico.
   - Se os dados mostram algo crítico (gastos > ganhos, hábitos negligenciados), seja direto mas construtivo.
   - Se o usuário está indo bem, reconheça e incentive.

Data e hora atual: ${new Date().toLocaleString('pt-PT')}
`;

    // --- 2. Converter mensagens para o formato do Gemini ---
    // O Gemini usa 'model' em vez de 'assistant'
    const geminiContents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // --- 3. Chamada à API (Modelo gemini-2.5-flash) ---
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiContents,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorText = JSON.stringify(errorData);
      console.error("Gemini API Error:", errorText);
      throw new Error(`Erro API Gemini (${response.status}): ${errorData.error?.message || errorData.error || 'Verifique a chave API e o modelo.'}`);
    }

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta gerada.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})