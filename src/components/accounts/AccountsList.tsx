import { useState } from "react";
import { motion } from "framer-motion";
import { Account, AccountType } from "@/types/finance";
import { Wallet, Landmark, Banknote, TrendingUp, MoreVertical, Pencil, Archive } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AccountsListProps {
    accounts: Account[];
    onEdit: (account: Account) => void;
    onArchive: (account: Account) => void;
    showProjectedBalance: boolean;
    onToggleProjectedBalance: (show: boolean) => void;
}

const getAccountIcon = (type: AccountType) => {
    switch (type) {
        case 'checking': return Landmark;
        case 'savings': return Wallet;
        case 'cash': return Banknote;
        case 'investment': return TrendingUp;
        default: return Wallet;
    }
};

export function AccountsList({
    accounts,
    onEdit,
    onArchive,
    showProjectedBalance,
    onToggleProjectedBalance
}: AccountsListProps) {

    if (accounts.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Nenhuma conta cadastrada</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-end space-x-2 mb-4">
                <Label htmlFor="projected-balance" className="text-xs text-muted-foreground font-light">
                    {showProjectedBalance ? "Saldo Previsto (Fim do mês)" : "Saldo Atual"}
                </Label>
                <Switch
                    id="projected-balance"
                    checked={showProjectedBalance}
                    onCheckedChange={onToggleProjectedBalance}
                />
            </div>

            <div className="grid gap-3">
                {accounts.map((account, index) => {
                    const Icon = getAccountIcon(account.type);

                    return (
                        <motion.div
                            key={account.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="widget-card flex items-center gap-4 relative overflow-hidden group"
                        >
                            <div
                                className="absolute left-0 top-0 bottom-0 w-1.5"
                                style={{ backgroundColor: account.color }}
                            />

                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${account.color}20` }}
                            >
                                <Icon className="w-5 h-5" style={{ color: account.color }} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-regular text-sm truncate">{account.name}</h3>
                                <p className="text-xs text-muted-foreground capitalize">
                                    {account.type === 'checking' ? 'Conta Corrente' :
                                        account.type === 'cash' ? 'Dinheiro' :
                                            account.type === 'savings' ? 'Poupança' : 'Investimento'}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className={`font-medium ${account.current_balance < 0 ? 'text-red-500' : ''}`}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.current_balance)}
                                </p>
                                {!account.include_in_dashboard && (
                                    <p className="text-[10px] text-muted-foreground opacity-70">
                                        Não soma no total
                                    </p>
                                )}
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(account)}>
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onArchive(account)} className="text-destructive">
                                        <Archive className="w-4 h-4 mr-2" />
                                        Arquivar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
