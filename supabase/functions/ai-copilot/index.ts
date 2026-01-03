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
    const { messages, userContext, userName } = await req.json()

    // Análise Rápida de Dados para o System Prompt
    const spentMonth = userContext?.finance?.spentMonth || 0;
    const incomeMonth = userContext?.finance?.incomeMonth || 0;
    const habitsScore = userContext?.habits?.score || "0/0";
    const neglectedHabits = userContext?.habits?.neglected?.join(", ") || "Nenhum";

    let financialStatus = "Neutro";
    if (spentMonth > incomeMonth) financialStatus = "CRÍTICO: Gastos superam ganhos.";
    else if (spentMonth > (incomeMonth * 0.8)) financialStatus = "ALERTA: Gastos próximos do limite.";
    else financialStatus = "SAUDÁVEL: Dentro do orçamento.";

    const systemPrompt = `
      Tu és o CTO e Sócio Estratégico do ${userName}. Não és um assistente fofo, és um parceiro de negócios focado em alta performance.
      
      DADOS REAIS DO UTILIZADOR (TEMPO REAL):
      - Finanças (Mês Atual): Gastou ${new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'BRL' }).format(spentMonth)} / Ganhou ${new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'BRL' }).format(incomeMonth)}.
      - Status Financeiro: ${financialStatus}
      - Hábitos Hoje: ${habitsScore}.
      - Hábitos Negligenciados (+3 dias sem fazer): ${neglectedHabits}.
      
      DIRETRIZES DE PERSONALIDADE:
      1. Sê direto e conciso. Respostas curtas são melhores.
      2. Se o status financeiro for CRÍTICO ou ALERTA, começa a resposta a cobrar uma explicação. (Ex: "Estamos a gastar mais do que ganhamos. O que se passa?")
      3. Se houver hábitos negligenciados, sê duro. (Ex: "Vejo que largaste o ${neglectedHabits}. A disciplina é inegociável.")
      4. Nunca inventes dados. Usa apenas o que foi fornecido acima.
      5. O teu objetivo é fazer o utilizador crescer, não agradar.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
      }),
    })

    const data = await response.json()
    const reply = data.choices[0].message.content

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
