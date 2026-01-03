const testAIFunction = async () => {
    const SUPABASE_URL = 'https://ahubncrfcdxsqrloqaeb.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodWJuY3JmY2R4c3FybG9xYWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NDcyOTQsImV4cCI6MjA4MzAyMzI5NH0.WY4xiy7EuQgJ9kbbnrC_af25vwU7GJqGvsdJzWMquf4';

    const testData = {
        messages: [
            { role: 'user', content: 'Olá, teste' }
        ],
        userContext: {
            finance: {
                balance: 0,
                spentToday: 0,
                spentMonth: 0,
                spentLastMonth: 0,
                incomeMonth: 0
            },
            habits: {
                total: 0,
                completedToday: 0,
                score: '0/0',
                neglected: []
            },
            tasks: {
                pendingCount: 0,
                priorityTasks: []
            },
            calendar: {
                todayEvents: 0
            }
        },
        userName: 'Teste'
    };

    try {
        console.log('🔍 Testando Edge Function...');
        const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-copilot`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify(testData)
        });

        console.log('📊 Status:', response.status);
        console.log('📝 Status Text:', response.statusText);

        const data = await response.json();
        console.log('📦 Resposta:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✅ SUCESSO! A IA respondeu:', data.reply);
        } else {
            console.error('❌ ERRO:', data.error || data);
        }
    } catch (error) {
        console.error('❌ Erro ao testar:', error.message);
    }
};

testAIFunction();
