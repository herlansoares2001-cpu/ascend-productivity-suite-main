import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Privacy = () => {
    return (
        <div className="page-container pb-24 max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <Link to="/profile">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Voltar
                    </Button>
                </Link>
                <span className="text-xs text-muted-foreground">Revisão: 2.0</span>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 text-zinc-300 text-justify"
            >
                <h1 className="text-3xl font-bold text-white mb-2">Política de Privacidade Global</h1>
                <p className="text-sm text-zinc-500 italic border-l-2 border-[#D4F657] pl-4">
                    Sua privacidade é inegociável. Esta política descreve como o Ascend Productivity Suite trata seus dados pessoais, em conformidade com a LGPD (Brasil) e GDPR (Europa).
                </p>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">1. Dados que Coletamos</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg">
                            <h3 className="font-bold text-white mb-2">Dados de Cadastro</h3>
                            <p className="text-sm">Nome, E-mail, Foto de Perfil e Credenciais de Login (via Autenticação segura).</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                            <h3 className="font-bold text-white mb-2">Dados de Uso</h3>
                            <p className="text-sm">Seus hábitos, metas, status de tarefas, histórico de chat com a IA e transações financeiras inseridas.</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                            <h3 className="font-bold text-white mb-2">Dados Técnicos</h3>
                            <p className="text-sm">Endereço IP, tipo de dispositivo, logs de erro e informações de cookies para manutenção de sessão.</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                            <h3 className="font-bold text-white mb-2">Dados Financeiros (Pagamento)</h3>
                            <p className="text-sm">Dados de cartão são processados exclusivamente pela Stripe. Não armazenamos números completos de cartão nos nossos servidores.</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">2. Finalidade do Tratamento</h2>
                    <ul className="list-disc pl-5 space-y-2 marker:text-[#D4F657]">
                        <li><strong>Prestação de Serviço:</strong> Permitir que você crie, gerencie e acompanhe seus dados de produtividade.</li>
                        <li><strong>Personalização:</strong> Utilizar a IA para oferecer sugestões baseadas no seu comportamento (ex: "Você costuma falhar o hábito X às terças").</li>
                        <li><strong>Segurança:</strong> Prevenção de fraudes e proteção contra acessos não autorizados.</li>
                        <li><strong>Comunicação:</strong> Envio de e-mails transacionais (redefinição de senha, confirmação de assinatura).</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">3. Compartilhamento de Dados</h2>
                    <p>Nós <strong>NÃO</strong> vendemos seus dados para anunciantes. O compartilhamento ocorre apenas com:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Google Cloud/Supabase:</strong> Infraestrutura de hospedagem e banco de dados.</li>
                        <li><strong>Stripe:</strong> Processamento de pagamentos.</li>
                        <li><strong>Google Gemini API:</strong> Processamento de linguagem natural. A Google não utiliza seus dados da API para treinar modelos públicos, conforme seus termos Enterprise.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">4. Seus Direitos (LGPD)</h2>
                    <p>Você é o titular dos seus dados. A qualquer momento, você pode exercer seus direitos através do menu de Configurações:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Direito de Acesso:</strong> Baixar uma cópia completa de seus dados (Recurso de Exportação disponível).</li>
                        <li><strong>Direito de Esquecimento:</strong> Solicitar a exclusão total da conta e dados associados.</li>
                        <li><strong>Revogação de Consentimento:</strong> Cancelar o recebimento de comunicações de marketing.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">5. Cookies e Rastreamento</h2>
                    <p>
                        Utilizamos apenas cookies essenciais para manter sua sessão logada e cookies analíticos anônimos para entender a performance do aplicativo.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">6. Encarregado de Dados (DPO)</h2>
                    <p>
                        Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato com nosso Encarregado de Proteção de Dados pelo e-mail: privacy@seusite.com.
                    </p>
                </section>

                <div className="pt-8 border-t border-white/10 text-sm text-zinc-500">
                    <p>Ascend Productivity Suite © 2026. Todos os direitos reservados.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Privacy;
