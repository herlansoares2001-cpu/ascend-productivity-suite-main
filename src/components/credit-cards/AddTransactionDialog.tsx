import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TransactionCategory } from "@/types/credit-card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AddTransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cardId: string;
    onAddTransaction: (transaction: {
        card_id: string;
        valor: number;
        data_transacao: string;
        descricao: string;
        categoria_id: TransactionCategory;
        is_installment: boolean;
        total_installments?: number;
    }) => void;
}

const CATEGORY_OPTIONS = [
    { value: TransactionCategory.FOOD, label: 'Alimentação' },
    { value: TransactionCategory.TRANSPORT, label: 'Transporte' },
    { value: TransactionCategory.SHOPPING, label: 'Compras' },
    { value: TransactionCategory.ENTERTAINMENT, label: 'Lazer' },
    { value: TransactionCategory.HEALTH, label: 'Saúde' },
    { value: TransactionCategory.EDUCATION, label: 'Educação' },
    { value: TransactionCategory.BILLS, label: 'Contas' },
    { value: TransactionCategory.OTHER, label: 'Outros' },
];

export function AddTransactionDialog({
    open,
    onOpenChange,
    cardId,
    onAddTransaction
}: AddTransactionDialogProps) {
    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");
    const [categoria, setCategoria] = useState<TransactionCategory>(TransactionCategory.OTHER);
    const [data, setData] = useState<Date>(new Date());
    const [isParcelado, setIsParcelado] = useState(false);
    const [parcelas, setParcelas] = useState("1");

    const handleSubmit = () => {
        if (!descricao || !valor) return;

        const valorNumerico = parseFloat(valor.replace(',', '.'));
        const totalParcelas = isParcelado ? parseInt(parcelas) : 1;

        onAddTransaction({
            card_id: cardId,
            valor: valorNumerico,
            data_transacao: data.toISOString(),
            descricao,
            categoria_id: categoria,
            is_installment: isParcelado,
            total_installments: isParcelado ? totalParcelas : undefined
        });

        // Reset form
        setDescricao("");
        setValor("");
        setCategoria(TransactionCategory.OTHER);
        setData(new Date());
        setIsParcelado(false);
        setParcelas("1");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nova Transação</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Descrição */}
                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Input
                            id="descricao"
                            placeholder="Ex: Compra no supermercado"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                        />
                    </div>

                    {/* Valor */}
                    <div className="space-y-2">
                        <Label htmlFor="valor">Valor (R$)</Label>
                        <Input
                            id="valor"
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                        />
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                        <Label htmlFor="categoria">Categoria</Label>
                        <Select value={categoria} onValueChange={(value) => setCategoria(value as TransactionCategory)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORY_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Data */}
                    <div className="space-y-2">
                        <Label>Data da Compra</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-light">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={data}
                                    onSelect={(date) => date && setData(date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Parcelamento */}
                    <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-white/5">
                        <div className="space-y-0.5">
                            <Label htmlFor="parcelado">Compra parcelada</Label>
                            <p className="text-xs text-muted-foreground">
                                Dividir o valor em várias parcelas
                            </p>
                        </div>
                        <Switch
                            id="parcelado"
                            checked={isParcelado}
                            onCheckedChange={setIsParcelado}
                        />
                    </div>

                    {/* Número de Parcelas */}
                    {isParcelado && (
                        <div className="space-y-2">
                            <Label htmlFor="parcelas">Número de Parcelas</Label>
                            <Select value={parcelas} onValueChange={setParcelas}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
                                        <SelectItem key={num} value={num.toString()}>
                                            {num}x de R$ {valor ? (parseFloat(valor.replace(',', '.')) / num).toFixed(2) : '0,00'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={!descricao || !valor}>
                        Adicionar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
