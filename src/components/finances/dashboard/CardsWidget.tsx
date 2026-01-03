import { CardSummary } from "@/core/finance/dashboard-engine";
import { Progress } from "@/components/ui/progress";
import { CreditCard as CardIcon } from "lucide-react";

interface CardsWidgetProps {
    cards: CardSummary[];
    privacyMode: boolean;
    onViewInvoice: (cardId: string) => void;
}

export function CardsWidget({ cards, privacyMode, onViewInvoice }: CardsWidgetProps) {
    const formatCurrency = (value: number) => {
        if (privacyMode) return "R$ •••••";
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    if (cards.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <CardIcon className="w-5 h-5" /> Cartões de Crédito
            </h3>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {cards.map(card => {
                    // Calcular progresso do limite (baseado na fatura atual ou global?) 
                    // Se o engine manda usedLimit global:
                    const progress = Math.min((card.usedLimit / card.limit) * 100, 100);
                    const available = card.limit - card.usedLimit;

                    return (
                        <div key={card.id} className="min-w-[260px] snap-center bg-card border rounded-2xl p-4 flex flex-col justify-between"
                            style={{ borderTop: `4px solid ${card.color}` }}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium truncate pr-2">{card.name}</span>
                                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-muted uppercase">{card.brand}</span>
                                </div>
                                <p className="text-muted-foreground text-xs mb-1">Fatura Atual</p>
                                <p className="text-xl font-bold mb-4">{formatCurrency(card.currentInvoice)}</p>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Limite Usado</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-1.5" indicatorColor={card.color} />
                                <p className="text-xs text-right text-muted-foreground pt-1">
                                    Disp: {formatCurrency(available)}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
