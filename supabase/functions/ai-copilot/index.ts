import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const tools = [
  {
    type: "function",
    function: {
      name: "add_transaction",
      description: "Adiciona uma transação financeira (receita ou despesa). Use quando o usuário mencionar valores monetários, gastos, receitas, débitos ou créditos.",
      parameters: {
        type: "object",
        properties: {
          description: { type: "string", description: "Descrição da transação" },
          amount: { type: "number", description: "Valor da transação" },
          type: { type: "string", enum: ["income", "expense"], description: "Tipo: income (receita) ou expense (despesa/débito)" },
          category: { type: "string", enum: ["food", "transport", "shopping", "home", "entertainment", "coffee", "work", "other"], description: "Categoria da transação" },
        },
        required: ["description", "amount", "type", "category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_habit",
      description: "Cria um novo hábito para rastrear diariamente",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nome do hábito" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_task",
      description: "Adiciona uma nova tarefa à lista de tarefas",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título da tarefa" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_reminder",
      description: "Cria um novo lembrete",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "Texto do lembrete" },
          priority: { type: "string", enum: ["low", "medium", "high"], description: "Prioridade do lembrete" },
        },
        required: ["text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_note",
      description: "Cria uma nova nota/anotação",
      parameters: {
        type: "object",
        properties: {
          content: { type: "string", description: "Conteúdo da nota" },
        },
        required: ["content"],
      },
    },
  },
];

async function executeFunction(name: string, args: any, userId: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  console.log(`Executing function: ${name} with args:`, args);

  switch (name) {
    case "add_transaction": {
      const { error } = await supabase.from("transactions").insert({
        user_id: userId,
        description: args.description,
        amount: args.amount,
        type: args.type,
        category: args.category,
        transaction_date: new Date().toISOString().split('T')[0],
      });
      if (error) throw error;
      return { success: true, message: `Transação "${args.description}" de R$${args.amount} adicionada com sucesso!` };
    }
    case "add_habit": {
      const { error } = await supabase.from("habits").insert({
        user_id: userId,
        name: args.name,
      });
      if (error) throw error;
      return { success: true, message: `Hábito "${args.name}" criado com sucesso!` };
    }
    case "add_task": {
      const { error } = await supabase.from("tasks").insert({
        user_id: userId,
        title: args.title,
        completed: false,
      });
      if (error) throw error;
      return { success: true, message: `Tarefa "${args.title}" adicionada com sucesso!` };
    }
    case "add_reminder": {
      const { error } = await supabase.from("reminders").insert({
        user_id: userId,
        text: args.text,
        priority: args.priority || "medium",
      });
      if (error) throw error;
      return { success: true, message: `Lembrete "${args.text}" criado com sucesso!` };
    }
    case "add_note": {
      const { error } = await supabase.from("notes").insert({
        user_id: userId,
        content: args.content,
        is_quick_note: false,
      });
      if (error) throw error;
      return { success: true, message: `Nota criada com sucesso!` };
    }
    default:
      return { success: false, message: "Função não reconhecida" };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, contextData } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing message for user ${userId}: ${message}`);

    const contextPrompt = contextData ? `
DADOS EM TEMPO REAL DO USUÁRIO:
[Finanças]
- Gasto Hoje: R$ ${contextData.finance.spentToday?.toFixed(2)}
- Gasto Mês Atual: R$ ${contextData.finance.spentMonth?.toFixed(2)} (Mês Passado: R$ ${contextData.finance.spentLastMonth?.toFixed(2)})
- Receita Mês: R$ ${contextData.finance.incomeMonth?.toFixed(2)}

[Hábitos]
- Hoje: ${contextData.habits.score} completos.
- Negligenciados (>3 dias): ${contextData.habits.neglected?.join(', ') || "Nenhum"}

[Tarefas]
- Pendentes: ${contextData.tasks.pendingCount}
- Principais: ${contextData.tasks.priorityTasks?.join(', ')}

Atue como um "Analista de Vida". Se o usuário perguntar "como estou?", use esses dados para dar um feedback holístico (ex: "Financeiramente bem, mas está negligenciando a academia").
` : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um assistente pessoal (AI Copilot) para o Ascend Productivity Suite. O usuário espera que você gerencie a vida dele com proatividade.

${contextPrompt}

DIRETRIZES DE COMANDO:
Quando o usuário mencionar valores monetários, gastos, débitos, receitas ou qualquer transação financeira, SEMPRE use a função add_transaction.
- "débito de 50 em lazer" = add_transaction com type="expense" e category="entertainment"
- "gasto de 30 com comida" = add_transaction com type="expense" e category="food"
- "recebi 1000 de freelance" = add_transaction com type="income" e category="work"

Categorias disponíveis:
- food: alimentação
- transport: transporte
- shopping: compras
- home: casa
- entertainment: lazer/entretenimento
- coffee: café
- work: trabalho
- other: outros

Seja conciso, direto e amigável.`
          },
          { role: "user", content: message }
        ],
        tools,
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos para continuar usando a IA." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));

    const assistantMessage = data.choices[0].message;

    // Check if the AI wants to call a function
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const results = [];

      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        console.log(`Executing tool: ${functionName}`, functionArgs);

        const result = await executeFunction(functionName, functionArgs, userId);
        results.push(result);
      }

      // Return the action results
      return new Response(JSON.stringify({
        response: results.map(r => r.message).join("\n"),
        actions: results,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Regular text response
    return new Response(JSON.stringify({
      response: assistantMessage.content || "Desculpe, não entendi. Pode reformular?",
      actions: [],
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in ai-copilot function:', error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
