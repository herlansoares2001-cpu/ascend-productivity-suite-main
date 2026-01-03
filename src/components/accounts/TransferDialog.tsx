import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Account } from "@/types/finance";
import { toast } from "sonner";

interface TransferDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accounts: Account[];
    onTransfer: (data: {
        originAccountId: string;
        destinationAccountId: string;
        amount: number;
        date: Date;
        description: string;
    }) => void;
}

export function TransferDialog({ open, onOpenChange, accounts, onTransfer }: TransferDialogProps) {
    const [originAccountId, setOriginAccountId] = useState("");
    const [destinationAccountId, setDestinationAccountId] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState<Date>(new Date());
    const [description, setDescription] = useState("");

    // Reseta form ao abrir
    useEffect(() => {
        if (open) {
            setOriginAccountId(accounts.length > 0 ? accounts[0].id : "");
            setDestinationAccountId(accounts.length > 1 ? accounts[1].id : "");
            setAmount("");
            setDate(new Date());
            setDescription("");
        }
    }, [open, accounts]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!originAccountId || !destinationAccountId) {
            toast.error("Selecione as contas de origem e destino");
            return;
        }

        if (originAccountId === destinationAccountId) {
            toast.error("A conta de destino deve ser diferente da origem");
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Informe um valor válido");
            return;
        }

        onTransfer({
            originAccountId,
            destinationAccountId,
            amount: parseFloat(amount),
            date,
            description: description.trim() || "Transferência",
        });

        onOpenChange(false);
    };

    const activeAccounts = accounts.filter(a => !a.is_archived);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nova Transferência</DialogTitle>
                    <DialogDescription>
                        Transfira valores entre suas contas.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>De (Origem)</Label>
                            <Select value={originAccountId} onValueChange={setOriginAccountId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeAccounts.map((acc) => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            {acc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Para (Destino)</Label>
                            <Select value={destinationAccountId} onValueChange={setDestinationAccountId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeAccounts.map((acc) => (
                                        <SelectItem key={acc.id} value={acc.id} disabled={acc.id === originAccountId}>
                                            {acc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Valor (R$)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0,00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Data</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => d && setDate(d)}
                                    initialFocus
                                    className="pointer-events-auto"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição (Opcional)</Label>
                        <Input
                            id="description"
                            placeholder="Ex: Pagamento empréstimo"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">Confirmar Transferência</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
