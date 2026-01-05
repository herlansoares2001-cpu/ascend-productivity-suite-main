import { motion } from "framer-motion";
import { Check, X, Zap, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PlanProps {
    name: string;
    price: string;
    period: string;
    features: string[];
    notIncluded?: string[];
    recommended?: boolean;
    color: 'zinc' | 'lime' | 'purple';
    icon: React.ElementType;
    onSubscribe: () => void;
}

const colorStyles = {
    zinc: { div: "bg-zinc-500/10", icon: "text-zinc-400" },
    lime: { div: "bg-lime-500/10", icon: "text-lime-400" },
    purple: { div: "bg-purple-500/10", icon: "text-purple-400" }
};

const PlanCard = ({ name, price, period, features, notIncluded, recommended, color, icon: Icon, onSubscribe }: PlanProps) => {
    const styles = colorStyles[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className={cn(
                "relative flex flex-col p-6 rounded-3xl border transition-all duration-300",
                recommended
                    ? "bg-[#09090b] border-[#D4F657]/50 shadow-[0_0_30px_-10px_rgba(212,246,87,0.3)]"
                    : "bg-card/30 border-white/5 hover:border-white/10"
            )}
        >
            {recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#D4F657] text-black text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Mais Popular
                </div>
            )}

            <div className="mb-6">
                <div className={cn("inline-flex p-3 rounded-2xl mb-4", styles.div)}>
                    <Icon className={cn("w-6 h-6", styles.icon)} color={recommended ? "#D4F657" : "currentColor"} />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">{name}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{price}</span>
                    <span className="text-sm text-muted-foreground">/{period}</span>
                </div>
            </div>

            <div className="flex-1 space-y-4 mb-8">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className="mt-1 min-w-[16px]">
                            <Check className="w-4 h-4 text-[#D4F657]" />
                        </div>
                        <p className="text-sm text-zinc-300 font-light">{feature}</p>
                    </div>
                ))}
                {notIncluded?.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-50">
                        <div className="mt-1 min-w-[16px]">
                            <X className="w-4 h-4 text-zinc-600" />
                        </div>
                        <p className="text-sm text-zinc-500 font-light">{feature}</p>
                    </div>
                ))}
            </div>

            <Button
                onClick={onSubscribe}
                className={cn(
                    "w-full h-12 rounded-xl font-medium transition-all",
                    recommended
                        ? "bg-[#D4F657] text-black hover:bg-[#D4F657]/90 hover:scale-[1.02]"
                        : "bg-white/5 text-white hover:bg-white/10"
                )}
            >
                {price === "Grátis" ? "Plano Atual" : "Assinar Agora"}
            </Button>
        </motion.div>
    );
};

const Plans = () => {
    const navigate = useNavigate();

    const handleSubscribe = async (plan: string) => {
        if (plan === 'free') {
            toast.info("Você já está no plano Grátis.");
            return;
        }

        try {
            toast.loading("Iniciando checkout...");

            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error("Usuário não logado. Por favor faça login novamente.");
            }

            const response = await fetch('https://ahubncrfcdxsqrloqaeb.supabase.co/functions/v1/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plan }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erro detalhado do servidor:", errorData);

                if (response.status === 401 || (errorData?.message && errorData.message.includes("Invalid JWT"))) {
                    console.error("DEBUG AUTH ERROR:", errorData);
                    toast.error(`Erro de Autenticação (Debug): 
                        Header: ${errorData.debug_header_start} 
                        URL: ${errorData.debug_url_start} 
                        Key: ${errorData.debug_key_start}
                    `, { duration: 10000 });
                    // await supabase.auth.signOut();
                    // window.location.href = "/auth"; 
                    return;
                }

                throw new Error(`Erro: ${errorData.error || "Desconhecido"} - ${errorData.details || ""}`);
            }

            const data = await response.json();

            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error("URL de checkout não recebida");
            }
        } catch (error: any) {
            toast.dismiss();
            toast.error(error.message);
            console.error("Erro completo:", error);
        }
    };

    return (
        <div className="page-container pb-24">
            <motion.div
                className="text-center max-w-2xl mx-auto mb-12 pt-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl md:text-4xl font-light mb-4">Escolha o plano ideal para sua <span className="text-[#D4F657]">evolução</span>.</h1>
                <p className="text-muted-foreground font-light">Desbloqueie todo o potencial do seu Segundo Cérebro com recursos premium.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <PlanCard
                    name="Free"
                    price="Grátis"
                    period="sempre"
                    color="zinc"
                    icon={Shield}
                    features={[
                        "Dashboard Básico",
                        "Controle de Hábitos (até 3)",
                        "Finanças (Receitas e Despesas)",
                        "Anotações Simples"
                    ]}
                    notIncluded={[
                        "AI Copilot",
                        "Relatórios Avançados",
                        "Sincronização Multi-device (Em breve)",
                        "Suporte Prioritário"
                    ]}
                    onSubscribe={() => handleSubscribe('free')}
                />

                <PlanCard
                    name="Standard"
                    price="R$ 29,90"
                    period="mês"
                    recommended={true}
                    color="lime"
                    icon={Zap}
                    features={[
                        "Tudo do Free",
                        "Hábitos Ilimitados",
                        "AI Copilot (50 msg/dia)",
                        "Metas e Projetos",
                        "Gráficos Financeiros"
                    ]}
                    notIncluded={[
                        "AI Copilot Ilimitado",
                        "Consultoria Mensal",
                    ]}
                    onSubscribe={() => handleSubscribe('standard')}
                />

                <PlanCard
                    name="Premium"
                    price="R$ 59,90"
                    period="mês"
                    color="purple"
                    icon={Crown}
                    features={[
                        "Tudo do Standard",
                        "AI Copilot Ilimitado",
                        "Backup Automático",
                        "Temas Exclusivos",
                        "Acesso Antecipado a Features"
                    ]}
                    onSubscribe={() => handleSubscribe('premium')}
                />
            </div>

            <div className="mt-16 text-center">
                <p className="text-sm text-zinc-500">Dúvidas? Entre em contato com nosso suporte.</p>
            </div>
        </div>
    );
};

export default Plans;
