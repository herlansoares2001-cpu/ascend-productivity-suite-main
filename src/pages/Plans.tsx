import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Zap, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionCheckout } from "@/components/subscription/SubscriptionCheckout";

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

const PlanCard = ({ name, price, period, features, notIncluded, recommended, color, icon: Icon, onSubscribe, isCurrentPlan }: PlanProps & { isCurrentPlan?: boolean }) => {
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
                    : "bg-card/30 border-white/5 hover:border-white/10",
                isCurrentPlan && "border-[#D4F657] bg-[#D4F657]/5"
            )}
        >
            {recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#D4F657] text-black text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Mais Popular
                </div>
            )}

            {isCurrentPlan && (
                <div className="absolute top-4 right-4 px-2 py-0.5 bg-[#D4F657] text-black text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Atual
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
                disabled={isCurrentPlan}
                className={cn(
                    "w-full h-12 rounded-xl font-medium transition-all",
                    recommended
                        ? "bg-[#D4F657] text-black hover:bg-[#D4F657]/90 hover:scale-[1.02]"
                        : "bg-white/5 text-white hover:bg-white/10",
                    isCurrentPlan && "opacity-100 bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/50"
                )}
            >
                {isCurrentPlan ? "Plano Atual" : (price === "Grátis" ? "Downgrade" : "Assinar Agora")}
            </Button>
        </motion.div>
    );
};

import { usePlanLimits } from "@/hooks/usePlanLimits";

const Plans = () => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const { currentPlan } = usePlanLimits();

    const handleSubscribe = (plan: string) => {
        if (plan === currentPlan) {
            return;
        }

        if (plan === 'free') {
            toast.info("Para cancelar sua assinatura paga, acesse o portal de cliente ou entre em contato com o suporte.", {
                action: {
                    label: "Suporte",
                    onClick: () => window.open('mailto:suporte@seusite.com')
                }
            });
            return;
        }

        setSelectedPlan(plan);
        setIsCheckoutOpen(true);
    };

    return (
        <div className="page-container pb-24">
            {selectedPlan && (
                <SubscriptionCheckout
                    plan={selectedPlan}
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                />
            )}
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
                    isCurrentPlan={currentPlan === 'free'}
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
                    price="R$ 19,90"
                    period="mês"
                    recommended={true}
                    color="lime"
                    icon={Zap}
                    isCurrentPlan={currentPlan === 'standard'}
                    features={[
                        "Até 20 Hábitos",
                        "Até 5 Contadores (Streaks)",
                        "Módulo Financeiro Completo",
                        "AI Copilot (20 msg/dia)",
                        "Metas e Projetos"
                    ]}
                    notIncluded={[
                        "AI Copilot Ilimitado",
                        "Hábitos Ilimitados",
                    ]}
                    onSubscribe={() => handleSubscribe('standard')}
                />

                <PlanCard
                    name="Premium"
                    price="R$ 29,90"
                    period="mês"
                    color="purple"
                    icon={Crown}
                    isCurrentPlan={currentPlan === 'premium'}
                    features={[
                        "Hábitos Ilimitados",
                        "Streaks Ilimitados",
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
