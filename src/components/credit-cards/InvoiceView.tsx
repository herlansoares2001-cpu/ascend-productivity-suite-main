import { Invoice, InvoiceStatus, TransactionCategory } from "@/types/credit-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    ShoppingBag,
    Utensils,
    Car,
    Film,
    Heart,
    GraduationCap,
    FileText,
    MoreHorizontal,
    Wallet,
    ArrowRight,
    Home,
    Zap,
    Monitor,
    AlertTriangle,
    CreditCard as CreditCardIcon
} from "lucide-react";
import { format, isSameDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LimitInfo {
    total: number;
    used: number;
    available: number;
}

interface InvoiceViewProps {
    invoices: Invoice[];
    onPayInvoice: (invoice: Invoice) => void;
    cardColor: string;
    limitInfo?: LimitInfo;
}

const getCategoryIcon = (categoryStr: string) => {
    const s = categoryStr.toLowerCase();
    if (s.includes('food') || s.includes('comida') || s.includes('restaurante')) return Utensils;
    if (s.includes('transport') || s.includes('uber') || s.includes('posto')) return Car;
    if (s.includes('home') || s.includes('casa') || s.includes('luz')) return Home;
    if (s.includes('shopping') || s.includes('compra')) return ShoppingBag;
    if (s.includes('health') || s.includes('saude')) return Heart;
    return CreditCardIcon;
};

const CATEGORY_ICONS: Record<TransactionCategory, any> = {
    [TransactionCategory.FOOD]: Utensils,
    [TransactionCategory.TRANSPORT]: Car,
    [TransactionCategory.SHOPPING]: ShoppingBag,
    [TransactionCategory.ENTERTAINMENT]: Film,
    [TransactionCategory.HEALTH]: Heart,
    [TransactionCategory.EDUCATION]: GraduationCap,
    [TransactionCategory.BILLS]: FileText,
    [TransactionCategory.OTHER]: MoreHorizontal,
};

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
    [TransactionCategory.FOOD]: 'Alimentação',
    [TransactionCategory.TRANSPORT]: 'Transporte',
    [TransactionCategory.SHOPPING]: 'Compras',
    [TransactionCategory.ENTERTAINMENT]: 'Lazer',
    [TransactionCategory.HEALTH]: 'Saúde',
    [TransactionCategory.EDUCATION]: 'Educação',
    [TransactionCategory.BILLS]: 'Contas',
    [TransactionCategory.OTHER]: 'Outros',
};

const STATUS_CONFIG = {
    [InvoiceStatus.OPEN]: { label: 'Aberta', icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
    [InvoiceStatus.CLOSED]: { label: 'Fechada', icon: AlertCircle, color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
    [InvoiceStatus.PAID]: { label: 'Paga', icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
    [InvoiceStatus.OVERDUE]: { label: 'Vencida', icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' }
};

export function InvoiceView({ invoices, onPayInvoice, cardColor, limitInfo }: InvoiceViewProps) {
    const { accounts } = useFinancialData();
    const [selectedAccountForSim, setSelectedAccountForSim] = useState<string>("");

    // Find first 'Actionable' invoice (Open/Closed) or just start 0
    // Actually typically current month is relevant.
    const [currentIndex, setCurrentIndex] = useState(() => {
        const found = invoices.findIndex(inv => inv.status === InvoiceStatus.OPEN || inv.status === InvoiceStatus.CLOSED);
        return found >= 0 ? found : 0;
    });

    const currentInvoice = invoices[currentIndex];
    const canGoPrev = currentIndex > 0;
    const canGoNext = currentIndex < invoices.length - 1;

    if (!currentInvoice) {
        return (
            <Card className="widget-card p-6 flex flex-col items-center justify-center min-h-[300px]">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">Nenhuma fatura disponível</p>
            </Card>
        );
    }

    const statusConfig = STATUS_CONFIG[currentInvoice.status];
    const StatusIcon = statusConfig.icon;
    const bestDay = format(subDays(new Date(currentInvoice.data_vencimento), 10), 'dd/MM'); // Mock determination

    const handlePrevious = () => { if (canGoPrev) setCurrentIndex(currentIndex - 1); };
    const handleNext = () => { if (canGoNext) setCurrentIndex(currentIndex + 1); };

    const monthName = format(new Date(currentInvoice.ano_referencia, currentInvoice.mes_referencia - 1), 'MMMM', { locale: ptBR });

    // Grouping Logic
    const grouped = currentInvoice.transactions.reduce((acc, t) => {
        const cat = t.categoria_id;
        if (!acc[cat]) acc[cat] = { transactions: [], total: 0 };
        acc[cat].transactions.push(t);
        acc[cat].total += t.valor;
        return acc;
    }, {} as Record<string, { transactions: typeof currentInvoice.transactions, total: number }>);

    const sortedGroups = Object.entries(grouped).sort((a, b) => b[1].total - a[1].total);

    // Simulation Logic
    const selectedAccountObj = accounts.find(a => a.id === selectedAccountForSim);
    const newBalance = selectedAccountObj ? (selectedAccountObj as any).balance - currentInvoice.total : 0;

    return (
        <Card className="widget-card overflow-hidden flex flex-col h-[600px]">
            {/* Header Sticky */}
            <div className="bg-card z-10 p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-2">
                    <Button variant="ghost" size="icon" onClick={handlePrevious} disabled={!canGoPrev} className="h-8 w-8 hover:bg-muted/50"><ChevronLeft className="w-4 h-4" /></Button>
                    <span className="font-medium text-sm capitalize">{monthName}</span>
                    <Button variant="ghost" size="icon" onClick={handleNext} disabled={!canGoNext} className="h-8 w-8 hover:bg-muted/50"><ChevronRight className="w-4 h-4" /></Button>
                </div>

                <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-widest font-semibold flex justify-center items-center gap-2">
                        <StatusIcon className={`w-3 h-3 ${statusConfig.color}`} />
                        {statusConfig.label}
                    </div>
                    {/* Header */}
                    <div className="p-6 text-white text-center rounded-none relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${cardColor}, #000)` }}>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">Fatura de {monthName}</span>
                                {/* Limit Bar Widget (Mini) */}
                                {limitInfo && (
                                    <div className="bg-black/30 p-2 rounded-lg text-xs text-left w-32 backdrop-blur-sm">
                                        <div className="flex justify-between mb-1 opacity-80"><span>Limite</span><span>{Math.round((limitInfo.used / limitInfo.total) * 100)}%</span></div>
                                        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-white" style={{ width: `${Math.min((limitInfo.used / limitInfo.total) * 100, 100)}%` }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-white/80 text-sm font-medium mb-1">Total da Fatura</p>
                            <h2 className="text-4xl font-bold mb-2 tracking-tight">R$ {currentInvoice.total.toFixed(2)}</h2>

                            <div className="flex justify-center gap-4 text-xs font-medium text-white/90">
                                <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">Vence em {format(new Date(currentInvoice.data_vencimento), 'dd/MM')}</span>
                                <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">Melhor dia {bestDay}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Scrolled */}
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-6">
                        {sortedGroups.map(([catId, data]) => {
                            const CategoryIcon = CATEGORY_ICONS[catId as TransactionCategory] || CATEGORY_ICONS['other'];
                            const groupIcon = getCategoryIcon(catId); // Use catId for getCategoryIcon
                            const Icon = groupIcon;
                            return (
                                <div key={catId} className="mb-6 last:mb-0">
                                    <div className="flex items-center justify-between mb-3 sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground mr-1">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <h3 className="font-medium text-sm text-foreground capitalize">{CATEGORY_LABELS[catId as TransactionCategory] === 'Outros' ? 'Outros' : CATEGORY_LABELS[catId as TransactionCategory]}</h3>
                                        </div>
                                        <span className="text-xs font-medium">R$ {data.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="space-y-1">
                                        {data.transactions.map((t) => (
                                            <div key={t.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors text-sm">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-1 h-8 rounded-full bg-muted/50" />
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">{t.descricao}</p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {format(new Date(t.data_transacao), 'dd MMM')}
                                                            {t.is_installment && ` • ${t.installment_number}/${t.total_installments}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="font-light whitespace-nowrap">
                                                    R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                {/* Actions Footer */}
                <div className="p-4 bg-muted/20 border-t border-border mt-auto">
                    <div className="flex gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="flex-1 text-xs h-9">
                                    <Wallet className="w-3 h-3 mr-2" />
                                    Simular
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Simular Pagamento</DialogTitle>
                                </DialogHeader>
                                <div className="py-4 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm">Escolha a conta para débito:</label>
                                        <Select value={selectedAccountForSim} onValueChange={setSelectedAccountForSim}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione uma conta" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.map(acc => (
                                                    <SelectItem key={acc.id} value={acc.id}>
                                                        {acc.name} (R$ {(acc as any).balance.toFixed(2)})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {selectedAccountObj && (
                                        <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Saldo Atual:</span>
                                                <span className={(selectedAccountObj as any).balance >= 0 ? "text-green-500" : "text-red-500"}>
                                                    R$ {(selectedAccountObj as any).balance.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-red-500">
                                                <span>Fatura:</span>
                                                <span>- R$ {currentInvoice.total.toFixed(2)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between font-bold pt-2">
                                                <span>Saldo Previsto:</span>
                                                <span className={newBalance >= 0 ? "text-green-500" : "text-red-500"}>
                                                    R$ {newBalance.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>

                        {(currentInvoice.status === InvoiceStatus.CLOSED || currentInvoice.status === InvoiceStatus.OVERDUE) && onPayInvoice && (
                            <Button
                                className="flex-1 text-xs h-9"
                                style={{ backgroundColor: cardColor }}
                                onClick={() => onPayInvoice(currentInvoice)}
                            >
                                <CheckCircle2 className="w-3 h-3 mr-2" />
                                Pagar
                            </Button>
                        )}
                    </div>
                </div>
        </Card>
    );
}
