import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Wallet, Landmark, Banknote, TrendingUp, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Account, AccountType, TransactionStatus, TransactionFrequency } from "@/types/finance";
import { getCategories, addCategory } from "@/core/finance/categories";

const getAccountIcon = (type: AccountType) => {
  switch (type) {
    case 'checking': return Landmark;
    case 'savings': return Wallet;
    case 'cash': return Banknote;
    case 'investment': return TrendingUp;
    default: return Wallet;
  }
};

interface TransactionFormProps {
  accounts: Account[];
  onSubmit: (data: {
    description: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    date: Date;
    account_id: string;
    // Advanced fields
    status: TransactionStatus;
    is_recurring: boolean;
    frequency?: TransactionFrequency;
    recurrence_count?: number;
    is_installment: boolean;
    total_installments?: number;
  }) => void;
  onCancel: () => void;
  initialData?: {
    description: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    date: Date;
    account_id?: string;
    status?: TransactionStatus;
    is_recurring?: boolean;
    frequency?: TransactionFrequency;
    is_installment?: boolean;
    total_installments?: number;
  };
  isLoading?: boolean;
}

export function TransactionForm({ onSubmit, onCancel, initialData, isLoading, accounts }: TransactionFormProps) {
  const [description, setDescription] = useState(initialData?.description || "");
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [type, setType] = useState<"income" | "expense">(initialData?.type || "expense");
  const [category, setCategory] = useState(initialData?.category || "other");
  const [date, setDate] = useState<Date>(initialData?.date || new Date());

  // Seleciona a conta inicial: ou a que veio na edição, ou a primeira conta disponível
  const [accountId, setAccountId] = useState(initialData?.account_id || (accounts.length > 0 ? accounts[0].id : ""));

  // Advanced States
  const [status, setStatus] = useState<TransactionStatus>(initialData?.status || "paid");

  // Recurrence state
  const [isRecurring, setIsRecurring] = useState(initialData?.is_recurring || false);
  const [frequency, setFrequency] = useState<TransactionFrequency>(initialData?.frequency || "monthly");
  const [recurrenceCount, setRecurrenceCount] = useState(12); // Default 1 ano

  // Installment state
  const [isInstallment, setIsInstallment] = useState(initialData?.is_installment || false);
  const [totalInstallments, setTotalInstallments] = useState(initialData?.total_installments || 2);

  // Category Logic
  const [categoriesList, setCategoriesList] = useState(getCategories());
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat = addCategory(newCategoryName);
    setCategoriesList(getCategories());
    setCategory(newCat.id);
    setIsCreatingCategory(false);
    setNewCategoryName("");
  };


  // Se a lista de contas mudar (ex: carregar do banco), atualiza o default se estiver vazio
  useEffect(() => {
    if (!accountId && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  // Auto-set status based on date (future = pending usually)
  useEffect(() => {
    if (!initialData) {
      if (date > new Date()) setStatus("pending");
      else setStatus("paid");
    }
  }, [date, initialData]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || !accountId) return;

    onSubmit({
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date,
      account_id: accountId,
      status,
      is_recurring: isRecurring,
      frequency: isRecurring ? frequency : undefined,
      recurrence_count: isRecurring ? recurrenceCount : undefined,
      is_installment: isInstallment,
      total_installments: isInstallment ? totalInstallments : undefined
    });
  };

  const getActiveAccounts = () => accounts.filter(acc => !acc.is_archived);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          placeholder="Ex: Almoço, Uber, Salário..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Valor (R$)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Conta</Label>
        <Select value={accountId} onValueChange={setAccountId} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a conta" />
          </SelectTrigger>
          <SelectContent>
            {getActiveAccounts().map((acc) => {
              const Icon = getAccountIcon(acc.type);
              return (
                <SelectItem key={acc.id} value={acc.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: acc.color }}
                    />
                    <span>{acc.name}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Tipo</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={type === "expense" ? "default" : "outline"}
            onClick={() => setType("expense")}
            className="w-full"
          >
            Despesa
          </Button>
          <Button
            type="button"
            variant={type === "income" ? "default" : "outline"}
            onClick={() => setType("income")}
            className="w-full"
          >
            Receita
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Categoria</Label>
        {isCreatingCategory ? (
          <div className="flex gap-2 animate-in fade-in slide-in-from-left-2">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nome da nova categoria"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
            />
            <Button type="button" size="icon" onClick={handleCreateCategory} variant="default"><Check className="w-4 h-4" /></Button>
            <Button type="button" size="icon" onClick={() => setIsCreatingCategory(false)} variant="ghost"><X className="w-4 h-4" /></Button>
          </div>
        ) : (
          <Select value={category} onValueChange={(val) => {
            if (val === 'new_custom_action') setIsCreatingCategory(true);
            else setCategory(val);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categoriesList.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
              <SelectItem value="new_custom_action" className="font-medium text-primary bg-primary/5 focus:bg-primary/10 mt-1 border-t cursor-pointer">
                <div className="flex items-center gap-2 py-1"><Plus className="w-4 h-4" /> Criar Nova Categoria</div>
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Date & Status Row */}
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
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
          <Label>Status</Label>
          <div className="flex items-center space-x-2 h-10">
            <Switch
              checked={status === 'paid'}
              onCheckedChange={(c) => setStatus(c ? 'paid' : 'pending')}
            />
            <span className="text-sm text-muted-foreground">
              {status === 'paid' ? (type === 'income' ? 'Recebido' : 'Pago') : 'Pendente'}
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Options Section */}
      <div className="space-y-4 border-t pt-4">
        {/* Recurrence Switch */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Repetir lançamento</Label>
            <p className="text-xs text-muted-foreground">Conta fixa (Aluguel, Salary, etc)</p>
          </div>
          <Switch
            checked={isRecurring}
            onCheckedChange={(c) => {
              setIsRecurring(c);
              if (c) setIsInstallment(false); // Mutually exclusive
            }}
          />
        </div>

        {isRecurring && (
          <div className="grid grid-cols-2 gap-4 pl-2 border-l-2 border-primary/20">
            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Repetir por</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="2"
                  value={recurrenceCount}
                  onChange={e => setRecurrenceCount(parseInt(e.target.value))}
                />
                <span className="text-xs text-muted-foreground">vezes</span>
              </div>
            </div>
          </div>
        )}

        {/* Installment Switch (Only for Expense) */}
        {type === 'expense' && (
          <>
            <div className="flex items-center justify-between mt-4">
              <div className="space-y-0.5">
                <Label>Parcelamento</Label>
                <p className="text-xs text-muted-foreground">Dividir valor em várias vezes</p>
              </div>
              <Switch
                checked={isInstallment}
                onCheckedChange={(c) => {
                  setIsInstallment(c);
                  if (c) setIsRecurring(false); // Mutually exclusive
                }}
              />
            </div>

            {isInstallment && (
              <div className="pl-2 border-l-2 border-primary/20 space-y-2">
                <Label>Número de Parcelas</Label>
                <Input
                  type="number"
                  min="2"
                  max="60"
                  value={totalInstallments}
                  onChange={e => setTotalInstallments(parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Serão criados {totalInstallments} lançamentos de R$ {(parseFloat(amount || "0") / totalInstallments).toFixed(2)}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || !accountId} className="flex-1">
          {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
