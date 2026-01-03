import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Account, ACCOUNT_TYPES, AccountType } from "@/types/finance";
import { toast } from "sonner";

interface AccountFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (account: Omit<Account, "id" | "current_balance" | "user_id" | "created_at" | "updated_at">) => void;
    initialData?: Account;
}

const COLORS = [
    "#EC7000", // Laranja Itaú
    "#DC241F", // Vermelho Santander/Bradesco
    "#FDB913", // Amarelo BB
    "#8A05BE", // Roxo Nubank
    "#2ECC71", // Verde (Dinheiro/Carteira)
    "#3498DB", // Azul
    "#9B59B6", // Roxo Claro
    "#34495E", // Escuro
];

export function AccountFormDialog({ open, onOpenChange, onSubmit, initialData }: AccountFormDialogProps) {
    const [name, setName] = useState("");
    const [type, setType] = useState<AccountType>("checking");
    const [color, setColor] = useState(COLORS[0]);
    const [initialBalance, setInitialBalance] = useState("0");
    const [includeInDashboard, setIncludeInDashboard] = useState(true);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setColor(initialData.color);
            setInitialBalance(initialData.initial_balance.toString());
            setIncludeInDashboard(initialData.include_in_dashboard);
        } else {
            resetForm();
        }
    }, [initialData, open]);

    const resetForm = () => {
        setName("");
        setType("checking");
        setColor(COLORS[0]);
        setInitialBalance("0");
        setIncludeInDashboard(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("O nome da conta é obrigatório");
            return;
        }

        const balanceValue = parseFloat(initialBalance.replace(/\./g, '').replace(',', '.'));

        if (isNaN(balanceValue)) {
            toast.error("Valor de saldo inicial inválido");
            return;
        }

        onSubmit({
            name,
            type,
            color,
            initial_balance: isNaN(balanceValue) ? 0 : balanceValue,
            include_in_dashboard: includeInDashboard,
            is_archived: false
        });

        onOpenChange(false);
        resetForm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Conta" : "Nova Conta"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome da Conta</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Itaú Personalité, Carteira"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tipo de Conta</Label>
                            <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACCOUNT_TYPES.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Cor</Label>
                            <div className="flex gap-2 flex-wrap">
                                {COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                                            }`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => setColor(c)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="initialBalance">Saldo Inicial</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                            <Input
                                id="initialBalance"
                                type="number"
                                step="0.01"
                                className="pl-10"
                                value={initialBalance}
                                onChange={(e) => setInitialBalance(e.target.value)}
                                disabled={!!initialData} // Geralmente saldo inicial não edita após criação em alguns sistemas, mas vou deixar habilitado ou desabilitado? Organizze permite editar, mas recalcula tudo. Vou deixar bloqueado na edição por segurança inicial, ou permitir? O user pediu 'Initial Balance Setup' no form de criação.
                            />
                        </div>
                        {initialData && (
                            <p className="text-xs text-muted-foreground">
                                O saldo inicial só pode ser definido na criação. Para ajustar, crie uma transação de ajuste.
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between space-x-2 pt-2">
                        <Label htmlFor="dashboard" className="flex flex-col space-y-1">
                            <span>Incluir na Visão Geral</span>
                            <span className="font-normal text-xs text-muted-foreground">
                                Somar o saldo desta conta no total
                            </span>
                        </Label>
                        <Switch
                            id="dashboard"
                            checked={includeInDashboard}
                            onCheckedChange={setIncludeInDashboard}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">Salvar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
