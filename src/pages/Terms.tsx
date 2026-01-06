import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Terms = () => {
    return (
        <div className="page-container pb-24 max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <Link to="/profile">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Voltar
                    </Button>
                </Link>
                <span className="text-xs text-muted-foreground">Vigência: 01/01/2026</span>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 text-zinc-300 text-justify"
            >
                <h1 className="text-3xl font-bold text-white mb-2">Termos e Condições de Uso</h1>
                <p className="text-sm text-zinc-500 italic border-l-2 border-[#D4F657] pl-4">
                    Bem-vindo ao Ascend Productivity Suite ("Nós", "Plataforma" ou "Ascend"). Estes Termos regem o acesso e uso de nossas aplicações web e móveis. Ao criar uma conta, você celebra um contrato vinculativo conosco.
                </p>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">1. Objeto e Aceitação</h2>
                    <p>
                        1.1. O Ascend é uma plataforma SaaS (Software as a Service) focada em produtividade pessoal, oferecendo ferramentas de gestão de hábitos, metas, finanças e assistente virtual baseado em Inteligência Artificial.
                    </p>
                    <p>
                        1.2. Ao se cadastrar, você declara ser maior de 18 anos ou possuir autorização legal, e concorda integralmente com estes Termos.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">2. Planos e Assinaturas</h2>
                    <p>
                        2.1. <strong>Do Pagamento:</strong> Oferecemos planos gratuitos e pagos (Standard e Premium). Os planos pagos garantem acesso a funcionalidades exclusivas. O pagamento é processado de forma segura através da Stripe Payments.
                    </p>
                    <p>
                        2.2. <strong>Renovação Automática:</strong> As assinaturas são renovadas automaticamente ao final de cada ciclo de faturamento (mensal), a menos que o cancelamento seja solicitado com no mínimo 24 horas de antecedência.
                    </p>
                    <p>
                        2.3. <strong>Reajuste de Preços:</strong> Reservamo-nos o direito de ajustar os valores das assinaturas, mediante aviso prévio de 30 dias por e-mail ou notificação no aplicativo.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">3. Uso da Inteligência Artificial (AI Copilot)</h2>
                    <p>
                        3.1. O recurso "AI Copilot" utiliza APIs de terceiros (Google Gemini). As respostas geradas são para fins informativos e não constituem aconselhamento profissional (médico, financeiro ou jurídico).
                    </p>
                    <p>
                        3.2. <strong>Uso Aceitável:</strong> É proibido utilizar a IA para gerar conteúdo de ódio, discriminação, exploração sexual, violência ou qualquer atividade ilegal. A violação resultará no banimento imediato sem reembolso.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">4. Propriedade Intelectual</h2>
                    <p>
                        4.1. Todo o código-fonte, design, logotipos e funcionalidades do Ascend são de propriedade exclusiva da empresa desenvolvedora.
                    </p>
                    <p>
                        4.2. O Usuário mantém a propriedade sobre os dados de entrada (seus hábitos, anotações e registros financeiros), concedendo ao Ascend uma licença limitada apenas para processamento e exibição desses dados dentro da plataforma.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">5. Limitação de Responsabilidade</h2>
                    <p>
                        5.1. O Ascend é fornecido "como está". Não garantimos que o serviço será ininterrupto ou livre de erros. Não nos responsabilizamos por perdas de dados decorrentes de falhas de internet, hardware do usuário ou força maior.
                    </p>
                    <p>
                        5.2. O módulo financeiro é uma ferramenta de organização. Não nos responsabilizamos por decisões de investimento ou prejuízos financeiros do usuário.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">6. Cancelamento e Rescisão</h2>
                    <p>
                        6.1. O usuário pode cancelar sua conta a qualquer momento nas configurações. O acesso aos recursos pagos cessa ao final do período já faturado.
                    </p>
                </section>

                <div className="pt-8 border-t border-white/10 text-sm text-zinc-500">
                    <p>Dúvidas legais? Contato: legal@seusite.com</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Terms;
