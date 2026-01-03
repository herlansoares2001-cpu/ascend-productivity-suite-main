import { CreditCard } from "@/types/credit-card";
import { LimiteInfo } from "@/types/credit-card";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { CreditCard as CreditCardIcon, TrendingUp, Calendar } from "lucide-react";
import { calcularMelhorDiaCompra } from "@/lib/credit-card-engine";

interface CreditCardWidgetProps {
    card: CreditCard;
    limiteInfo: LimiteInfo;
    faturaAtual?: number;
    compact?: boolean;
}

export function CreditCardWidget({ card, limiteInfo, faturaAtual = 0, compact = false }: CreditCardWidgetProps) {
    const melhorDia = calcularMelhorDiaCompra(card.dia_fechamento);
    const percentualUsado = Math.min(limiteInfo.percentual_uso, 100);

    return (
        <Card
            className={`widget-card overflow-hidden relative ${compact ? 'p-4' : ''}`}
            style={{
                borderLeft: `4px solid ${card.cor_hex}`
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className={`rounded-xl flex items-center justify-center ${compact ? 'w-10 h-10' : 'w-12 h-12'}`}
                        style={{ backgroundColor: `${card.cor_hex}20` }}
                    >
                        <CreditCardIcon
                            className={compact ? "w-5 h-5" : "w-6 h-6"}
                            style={{ color: card.cor_hex }}
                        />
                    </div>
                    <div>
                        <h3 className={`font-regular ${compact ? 'text-sm' : 'text-base'}`}>{card.nome}</h3>
                        <p className="text-xs text-muted-foreground uppercase">{card.bandeira}</p>
                    </div>
                </div>
            </div>

            {/* Limite Disponível */}
            <div className={`space-y-2 ${compact ? 'mb-2' : 'mb-4'}`}>
                <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">Limite disponível</span>
                    <span className="text-xl font-regular">
                        R$ {limiteInfo.limite_disponivel.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}
                    </span>
                </div>

                <Progress
                    value={percentualUsado}
                    className="h-2"
                    style={{
                        '--progress-background': card.cor_hex
                    } as React.CSSProperties}
                    indicatorColor={card.cor_hex}
                />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                        R$ {limiteInfo.limite_usado.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })} usado
                    </span>
                    <span>
                        {percentualUsado.toFixed(1)}%
                    </span>
                </div>
            </div>

            {/* Fatura Atual (mostra sempre que tiver) */}
            {faturaAtual > 0 && (
                <div className={`glass rounded-lg p-3 ${compact ? '' : 'mb-3'}`}>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Fatura atual</span>
                        <div className="text-right">
                            <p className="text-lg font-regular" style={{ color: card.cor_hex }}>
                                R$ {faturaAtual.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </p>
                            {!compact && (
                                <p className="text-xs text-muted-foreground">
                                    Vence dia {card.dia_vencimento}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Detalhes Extras (Apenas Modo Normal) */}
            {!compact && (
                <>
                    {/* Melhor Dia para Compra */}
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 mt-3">
                        <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-regular text-primary">
                                Melhor dia para compra: dia {melhorDia.dia}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {melhorDia.motivo}
                            </p>
                        </div>
                    </div>

                    {/* Datas importantes */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Fecha dia {card.dia_fechamento}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Vence dia {card.dia_vencimento}</span>
                        </div>
                    </div>
                </>
            )}
        </Card>
    );
}
