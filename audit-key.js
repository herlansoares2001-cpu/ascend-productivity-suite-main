// audit-key.js
// Substitua pela sua chave atual (aquela que começa por AIzaSy...)
const API_KEY = "AIzaSyDMpIuW8nfH4xZwNOGJsKn7DPKzCNRdGlY";

async function checkAvailableModels() {
    console.log("🔍 Auditando API Key no Google...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();

        if (!response.ok) {
            console.error("❌ ERRO NA CHAVE:", data.error.message);
            console.log("\n💡 SOLUÇÃO: A chave existe, mas não tem permissão. Crie uma chave via Google AI Studio (ver abaixo).");
            return;
        }

        console.log("✅ SUCESSO! Modelos disponíveis para esta chave:");
        const models = data.models.map(m => m.name.replace('models/', ''));
        console.log(models.join('\n'));

        if (models.includes('gemini-pro')) {
            console.log("\n🤔 Estranho... 'gemini-pro' está disponível. O erro pode ser de formatação na função.");
        } else {
            console.log("\n⚠️ O modelo 'gemini-pro' NÃO aparece na lista. Você deve usar um dos nomes listados acima.");
        }
    } catch (error) {
        console.error("Erro de conexão:", error);
    }
}

checkAvailableModels();
