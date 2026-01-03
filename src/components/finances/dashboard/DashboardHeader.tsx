import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Calendar, Plus } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
    totals: {
        income: number;
        expense: number;
        balance: number;
        projectedBalance: number;
    };
    privacyMode: boolean;
    onTogglePrivacy: () => void;
    currentDate: Date;

    onDateChange: (date: Date) => void;
    onNewTransaction?: () => void;
}

export function DashboardHeader({ totals, privacyMode, onTogglePrivacy, currentDate, onDateChange, onNewTransaction }: DashboardHeaderProps) {
    const formatCurrency = (value: number) => {
        if (privacyMode) return "R$ •••••";
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 bg-muted/30 p-1 rounded-full border">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onDateChange(subMonths(currentDate, 1))}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-2 min-w-[120px] justify-center text-sm font-medium capitalize">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onDateChange(addMonths(currentDate, 1))}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    {onNewTransaction && (
                        <Button size="sm" onClick={onNewTransaction} className="hidden md:flex">
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Transação
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onNewTransaction?.()} className="md:hidden">
                        <Plus className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onTogglePrivacy}>
                        {privacyMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5 text-muted-foreground" />}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card Saldo Geral */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-gray-300 text-sm font-medium mb-1">Saldo em Contas</p>
                        <h2 className="text-3xl font-bold mb-1">{formatCurrency(totals.balance)}</h2>
                        <p className="text-xs text-gray-400">
                            Previsto: <span className="text-gray-300">{formatCurrency(totals.projectedBalance)}</span>
                        </p>
                    </div>
                    <Wallet className="absolute right-4 bottom-4 w-12 h-12 text-white/5" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                </div>

                {/* Cards Entradas/Saídas (Compactos) */}
                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                    <div className="bg-card border p-4 rounded-xl flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <span className="text-sm text-muted-foreground">Entradas</span>
                        </div>
                        <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{formatCurrency(totals.income)}</p>
                    </div>

                    <div className="bg-card border p-4 rounded-xl flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                <TrendingDown className="w-4 h-4" />
                            </div>
                            <span className="text-sm text-muted-foreground">Saídas</span>
                        </div>
                        <p className="text-2xl font-semibold text-red-600 dark:text-red-400">{formatCurrency(totals.expense)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
