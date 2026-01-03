import { Transaction } from "@/types/finance";
import { format, isPast, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PendingWidgetProps {
    overdueTransactions: Transaction[];
    nextTransactions: Transaction[];
    onToggleStatus: (transaction: Transaction) => void;
    onViewAll: () => void;
    privacyMode: boolean;
}

export function PendingWidget({ overdueTransactions, nextTransactions, onToggleStatus, onViewAll, privacyMode }: PendingWidgetProps) {
    const hasItems = overdueTransactions.length > 0 || nextTransactions.length > 0;

    const formatCurrency = (value: number) => {
        if (privacyMode) return "R$ •••••";
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    if (!hasItems) {
        return (
            <div className="bg-card border rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-lg">Tudo em dia!</h3>
                <p className="text-muted-foreground text-sm">Nenhuma pendência próxima.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Próximos Lançamentos</h3>
                <Button variant="link" size="sm" onClick={onViewAll} className="text-primary p-0 h-auto">Ver tudo <ArrowRight className="w-3 h-3 ml-1" /></Button>
            </div>

            <div className="space-y-3">
                {/* Atrasados */}
                {overdueTransactions.map(t => (
                    <div key={t.id} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl">
                        <div onClick={() => onToggleStatus(t)} className="cursor-pointer text-red-500 hover:text-red-700">
                            <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center" title="Efetivar agora">
                                <AlertCircle className="w-3 h-3" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{t.description}</p>
                            <p className="text-xs text-red-600 font-medium">Atrasado • {format(parseISO(t.transaction_date), "dd MMM")}</p>
                        </div>
                        <span className="font-semibold text-red-600 text-sm">{formatCurrency(t.amount)}</span>
                    </div>
                ))}

                {/* Próximos */}
                {nextTransactions.map(t => (
                    <div key={t.id} className="flex items-center gap-3 p-3 bg-card border rounded-xl hover:bg-muted/30 transition-colors">
                        <div onClick={() => onToggleStatus(t)} className="cursor-pointer text-muted-foreground hover:text-green-500">
                            <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                                {/* Empty circle */}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{t.description}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {isSameDay(parseISO(t.transaction_date), new Date()) ? 'Hoje' : format(parseISO(t.transaction_date), "dd MMM")}
                            </p>
                        </div>
                        <span className={cn("font-medium text-sm", t.type === 'expense' ? 'text-red-500' : 'text-green-500')}>
                            {t.type === 'expense' ? '-' : '+'} {formatCurrency(t.amount)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
