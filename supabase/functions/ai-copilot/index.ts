import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserContext {
  finance?: {
    spentMonth?: number;
    incomeMonth?: number;
  };
  habits?: {
    score?: string;
    neglected?: string[];
  };
}

interface RequestPayload {
  messages: { role: string; content: string }[];
  userContext: UserContext;
  userName?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('CONFIG_ERROR: Variable GEMINI_API_KEY is missing.')
    }

    const payload: RequestPayload = await req.json()
    const { messages, userContext, userName } = payload

    // --- 1. System Prompt Refinado ---
    const systemPrompt = `
Você é o CTO e Sócio Estratégico do usuário (${userName || 'Herlan'}).
Personalidade: Direto, perspicaz, com alta inteligência emocional.

CONTEXTO DADOS:
${JSON.stringify(userContext, null, 2)}

REGRAS:
1. Saudação simples? Seja breve e encorajador.
2. Dados zerados? Chame de "Ciclo Inicial" e não foque no R$ 0,00.
3. Use Markdown profissional.
`;

    const geminiContents = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiContents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        return new Response(JSON.stringify({
          error: "Limite de solicitações atingido. O Sócio está analisando os dados, tente em 1 min.",
          code: 'RATE_LIMIT'
        }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw new Error(`Gemini API Error (${response.status}): ${errorData.error?.message || 'Falha na IA'}`);
    }

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta gerada.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error("Critical Failure:", error.message);
    const isConfigError = error.message.includes('CONFIG_ERROR');
    return new Response(JSON.stringify({
      error: isConfigError ? 'Erro interno de configuração (API Key).' : error.message
    }), {
      status: isConfigError ? 500 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})