import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Invoice } from "@/types/credit-card";
import { Account } from "@/types/finance";
import { AlertCircle, CheckCircle2, Wallet } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PayInvoiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    invoice: Invoice | null;
    cardName: string;
    cardColor: string;
    accounts: Account[]; // Contas reais
    onConfirmPayment: (contaId: string, valor: number) => void;
}

export function PayInvoiceDialog({
    open,
    onOpenChange,
    invoice,
    cardName,
    cardColor,
    accounts,
    onConfirmPayment
}: PayInvoiceDialogProps) {
    const [contaSelecionada, setContaSelecionada] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);

    if (!invoice) return null;

    const handleConfirm = async () => {
        if (!contaSelecionada) return;

        setIsProcessing(true);
        // Chama a função externa que fará a lógica real (transação, update, etc.)
        await onConfirmPayment(contaSelecionada, invoice.total);
        setIsProcessing(false);
        setContaSelecionada("");
        onOpenChange(false);
    };

    const contaInfo = accounts.find(c => c.id === contaSelecionada);
    // Verificar saldo: current_balance pode ser string ou number, garantir conversão
    const saldoAtual = contaInfo ? Number(contaInfo.current_balance) : 0;
    const saldoSuficiente = contaInfo ? saldoAtual >= invoice.total : false;

    const monthName = format(
        new Date(invoice.ano_referencia, invoice.mes_referencia - 1),
        'MMMM yyyy',
        { locale: ptBR }
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Pagar Fatura</DialogTitle>
                    <DialogDescription>
                        Confirme o pagamento da fatura do cartão {cardName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Resumo da Fatura */}
                    <div
                        className="rounded-xl p-4 border-2"
                        style={{
                            borderColor: cardColor,
                            backgroundColor: `${cardColor}10`
                        }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Fatura de {monthName}</span>
                            <span className="text-xs text-muted-foreground">
                                {invoice.transactions.length} transações
                            </span>
                        </div>

                        <div className="flex items-baseline justify-between">
                            <span className="text-sm">Valor total</span>
                            <span className="text-2xl font-regular" style={{ color: cardColor }}>
                                R$ {invoice.total.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </span>
                        </div>

                        <div className="mt-2 pt-2 border-t border-border/50">
                            <p className="text-xs text-muted-foreground">
                                Vencimento: {format(new Date(invoice.data_vencimento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </p>
                        </div>
                    </div>

                    {/* Seleção de Conta */}
                    <div className="space-y-2">
                        <Label htmlFor="conta">Pagar com a conta</Label>
                        <Select value={contaSelecionada} onValueChange={setContaSelecionada}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma conta" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((conta) => (
                                    <SelectItem key={conta.id} value={conta.id}>
                                        <div className="flex items-center justify-between w-full gap-4">
                                            <div>
                                                <p className="font-regular">{conta.name}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{conta.type === 'checking' ? 'Conta Corrente' : conta.type}</p>
                                            </div>
                                            <span className="text-sm ml-auto">
                                                R$ {Number(conta.current_balance).toLocaleString('pt-BR', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Avisos */}
                    {contaSelecionada && !saldoSuficiente && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm text-destructive font-regular">
                                    Saldo insuficiente
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    A conta selecionada não possui saldo suficiente para pagar esta fatura.
                                </p>
                            </div>
                        </div>
                    )}

                    {contaSelecionada && saldoSuficiente && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm text-primary font-regular">
                                    Saldo disponível
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Após o pagamento, o saldo será de R$ {(saldoAtual - invoice.total).toLocaleString('pt-BR', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Informação sobre o processo */}
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5">
                        <Wallet className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground">
                                Ao confirmar, será criada uma transação de débito na conta selecionada e o limite do cartão será liberado.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isProcessing}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!contaSelecionada || !saldoSuficiente || isProcessing}
                        style={{ backgroundColor: saldoSuficiente ? cardColor : undefined }}
                    >
                        {isProcessing ? (
                            <>Processando...</>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Confirmar Pagamento
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
