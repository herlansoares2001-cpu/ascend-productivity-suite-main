import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, TrendingUp, TrendingDown, Plus, Coffee, ShoppingCart, Car, Utensils, Home, Gamepad2, MoreVertical, Pencil, Trash2, Briefcase,
  CreditCard as CreditCardIcon, Landmark, ArrowRightLeft, CheckCircle2, Repeat, Layers
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { toast } from "sonner";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreditCard, Transaction as CreditCardTransaction, Invoice, TransactionCategory, CardBrand } from "@/types/credit-card";
import { Transaction as FinanceTransaction } from "@/types/finance";
import { CreditCardWidget } from "@/components/credit-cards/CreditCardWidget";
import { InvoiceView } from "@/components/credit-cards/InvoiceView";
import { AddTransactionDialog } from "@/components/credit-cards/AddTransactionDialog";
import { PayInvoiceDialog } from "@/components/credit-cards/PayInvoiceDialog";
import { AccountsList } from "@/components/accounts/AccountsList";
import { AccountFormDialog } from "@/components/accounts/AccountFormDialog";
import { TransferDialog } from "@/components/accounts/TransferDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  calcularLimiteDisponivel,
  agruparTransacoesPorFatura,
  gerarTransacoesParceladas
} from "@/core/finance/credit-card-engine";
import { createTransferTransactions } from "@/core/finance/account-engine";
import { generateInstallmentTransactions, generateRecurringTransactions } from "@/core/finance/transaction-engine";
import { getDashboardSummary } from "@/core/finance/dashboard-engine";
import { DashboardHeader } from "@/components/finances/dashboard/DashboardHeader";
import { PendingWidget } from "@/components/finances/dashboard/PendingWidget";
import { CardsWidget } from "@/components/finances/dashboard/CardsWidget";
import { useFinancialData } from "@/hooks/useFinancialData";
import { saveTransactionMeta, saveTransactionAccount } from "@/services/finance-storage";
import { getCategories } from "@/core/finance/categories";
import { useGamification } from "@/hooks/useGamification";
import { calculateProjectedCashFlow, calculateHistoricalCashFlow } from "@/core/finance/forecasting-engine";
import { Switch } from "@/components/ui/switch";
import { ChartSkeleton, CategoryChartSkeleton } from "@/components/finances/ChartSkeletons";
import { lazy, Suspense } from "react";

// Lazy loading for heavy charts if needed here too, but they are already imported above.
// To satisfy the user's request for lazy loading "widgets pesados", I'll make them lazy here too.
const CashFlowChartLazy = lazy(() => import("@/components/finances/CashFlowChart").then(m => ({ default: m.CashFlowChart })));
const CategoryChartLazy = lazy(() => import("@/components/finances/dashboard/CategoryChart").then(m => ({ default: m.CategoryChart })));


const Finances = () => {
  const categoriesList = getCategories();
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "cards" | "accounts">("overview");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  // Hook Centralizado
  const { transactions: financeTransactions, accounts, cards: realCards, createTransaction, updateTransaction, deleteTransaction, createAccount, updateAccount, createCard, refreshData, isLoading, totalBalance } = useFinancialData();
  const { awardXP } = useGamification();

  // UI States
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(undefined);
  const [showProjectedBalance, setShowProjectedBalance] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

  // Dashboard UI
  const [dashboardDate, setDashboardDate] = useState(new Date());
  const [privacyMode, setPrivacyMode] = useState(false);

  // Credit Cards
  const cards: CreditCard[] = useMemo(() => {
    if (!realCards) return [];
    return realCards.map(c => ({
      id: c.id,
      nome: c.name,
      bandeira: c.brand as any,
      limite_total: c.limit_amount,
      dia_fechamento: c.closing_day,
      dia_vencimento: c.due_day,
      cor_hex: c.color,
      created_at: c.created_at || new Date().toISOString(),
      updated_at: c.created_at || new Date().toISOString(),
      user_id: c.user_id
    }));
  }, [realCards]);

  const [creditTransactions, setCreditTransactions] = useState<CreditCardTransaction[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>(''); // Default: todos (revisado)
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isPayInvoiceOpen, setIsPayInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Novo Cartão State
  const [isNewCardOpen, setIsNewCardOpen] = useState(false);
  const [newCardData, setNewCardData] = useState({ nome: '', limite: '', dia_vencimento: '', cor: '#000000' });


  // --- Agrupamento Timeline ---
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, FinanceTransaction[]> = {};
    financeTransactions.forEach(t => {
      const dateKey = format(parseISO(t.transaction_date), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    return Object.keys(groups).sort().reverse().map(date => ({ date, items: groups[date] }));
  }, [financeTransactions]);

  // --- Forecasting Data ---
  const cashFlowData = useMemo(() => {
    if (showForecast) {
      return calculateProjectedCashFlow(totalBalance, financeTransactions, 90);
    } else {
      return calculateHistoricalCashFlow(totalBalance, financeTransactions, 30);
    }
  }, [showForecast, totalBalance, financeTransactions]);

  // --- Dashboard Data ---
  const activeAccounts = accounts.filter(a => !a.is_archived);
  const dashboardData = useMemo(() => {
    return getDashboardSummary(financeTransactions, activeAccounts, cards, creditTransactions, dashboardDate);
  }, [financeTransactions, activeAccounts, cards, creditTransactions, dashboardDate]);

  // --- Handlers Transações ---
  const handleCreate = useCallback(async (data: any) => {
    try {
      let txsToCreate: any[] = [];
      const basePayload = {
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        transaction_date: format(data.date, "yyyy-MM-dd"),
        account_id: data.account_id,
        is_paid: data.status === 'paid',
        status: data.status // Keep for UI compatibility if needed
      };

      if (data.is_installment && data.total_installments > 1) {
        // Temporarily generate objects to iterate
        const installmentTxs = generateInstallmentTransactions({ ...basePayload, user_id: 'user1' } as any, data.total_installments);
        txsToCreate = installmentTxs.map(t => ({
          ...basePayload,
          amount: t.amount,
          description: t.description,
          transaction_date: format(new Date(t.transaction_date), 'yyyy-MM-dd'),
          installment_group_id: t.installment_group_id,
          installment_number: t.installment_number,
          total_installments: t.total_installments,
          is_installment: true
        }));
      } else if (data.is_recurring) {
        // Simplify recurring logic: Create the first one, backend or user creates next?
        // App logic seems to create ALL iterations upfront? 
        // generateRecurringTransactions creates arrays.
        const recurringTxs = generateRecurringTransactions({ ...basePayload, user_id: 'user1' } as any, data.frequency, data.recurrence_count || 12);
        txsToCreate = recurringTxs.map(t => ({
          ...basePayload,
          transaction_date: format(new Date(t.transaction_date), 'yyyy-MM-dd'),
          is_recurring: true,
          recurrence_id: t.recurrence_id,
          frequency: data.frequency
        }));
      } else {
        txsToCreate = [basePayload];
      }

      toast.info(`Criando ${txsToCreate.length} lançamento(s)...`);
      for (const tx of txsToCreate) {
        await createTransaction.mutateAsync(tx);
        awardXP(15, "Nova Transação");
      }
      // refreshData(); // Handled by hook
      setIsSheetOpen(false);
    } catch (e) { console.error(e); toast.error("Erro ao criar"); }
  }, [createTransaction, awardXP]);

  const handleUpdate = useCallback(async (data: any) => {
    if (!editingTransaction) return;
    try {
      await updateTransaction.mutateAsync({
        id: editingTransaction.id,
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        transaction_date: format(data.date, "yyyy-MM-dd"),
        account_id: data.account_id,
        is_paid: data.status === 'paid',
        status: data.status // Keep compatibility
      });
      setIsSheetOpen(false);
      setEditingTransaction(null);
    } catch { toast.error("Erro ao atualizar"); }
  }, [editingTransaction, updateTransaction]);

  const toggleStatus = (t: FinanceTransaction) => {
    const newPaid = !t.is_paid && t.status !== 'paid'; // Toggle logic (if status is used as truth)
    // Actually best to check t.is_paid from DB. 
    // Assuming t comes from hook which has is_paid.
    const nextState = t.is_paid !== undefined ? !t.is_paid : (t.status === 'paid' ? false : true);

    updateTransaction.mutate({
      id: t.id,
      is_paid: nextState,
      status: nextState ? 'paid' : 'pending'
    });
  };

  // --- Handlers Contas ---
  const handleCreateAccount = useCallback(async (newAccount: any) => {
    createAccount.mutate(newAccount);
  }, [createAccount]);

  const handleUpdateAccount = useCallback(async (updatedData: any) => {
    if (!editingAccount) return;
    updateAccount.mutate({ id: editingAccount.id, ...updatedData });
  }, [editingAccount, updateAccount]);

  // --- Handlers Cartão ---
  const handleCreateCard = useCallback(async () => {
    console.log("Tentando criar cartão...", newCardData);
    if (!newCardData.nome || !newCardData.limite) {
      toast.error("Nome e Limite são obrigatórios");
      return;
    }

    try {
      await createCard.mutateAsync({
        name: newCardData.nome,
        limit_amount: parseFloat(newCardData.limite),
        due_day: parseInt(newCardData.dia_vencimento || '10'),
        closing_day: 5, // Default logic needed or input
        color: newCardData.cor,
        brand: CardBrand.VISA // Default
      });
      console.log("Cartão criado com sucesso!");
      setIsNewCardOpen(false);
      setNewCardData({ nome: '', limite: '', dia_vencimento: '', cor: '#000000' });
      // toast success handled by hook
      awardXP(50, "Novo Cartão Cadastrado");
    } catch (error) {
      console.error("Erro ao criar cartão:", error);
    }
  }, [newCardData, createCard, awardXP]);

  // Credit Cards View Logic
  const selectedCard = cards.find(c => c.id === selectedCardId);
  const renderCardView = () => {
    if (selectedCardId && selectedCard) {
      const cardTxs = creditTransactions.filter(t => t.card_id === selectedCardId);
      const limite = calcularLimiteDisponivel(selectedCard, cardTxs);
      const invs = agruparTransacoesPorFatura(cardTxs, selectedCard);
      const fatura = invs.find(i => i.mes_referencia === new Date().getMonth() + 1)?.total || 0;

      return (
        <div className="space-y-4">
          <div className="flex gap-2 mb-4 overflow-x-auto">
            <Button variant="outline" size="sm" onClick={() => setSelectedCardId('')}>← Todos Cartões</Button>
          </div>
          <CreditCardWidget card={selectedCard} limiteInfo={limite} faturaAtual={fatura} />
          <Button className="w-full" onClick={() => setIsAddTransactionOpen(true)} style={{ backgroundColor: selectedCard.cor_hex }}><Plus className="w-4 h-4 mr-2" />Compra neste Cartão</Button>
          <InvoiceView
            invoices={invs}
            onPayInvoice={(inv) => { setSelectedInvoice(inv); setIsPayInvoiceOpen(true); }}
            cardColor={selectedCard.cor_hex}
            limitInfo={{ total: limite.limite_total, used: limite.limite_usado, available: limite.limite_disponivel }}
          />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div onClick={() => setIsNewCardOpen(true)} className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/10 transition-colors h-[200px]">
          <Plus className="w-8 h-8 mb-2" />
          <span>Adicionar Cartão</span>
        </div>
        {cards.map(card => {
          const cardTxs = creditTransactions.filter(t => t.card_id === card.id);
          const limite = calcularLimiteDisponivel(card, cardTxs);
          const invs = agruparTransacoesPorFatura(cardTxs, card);
          const fatura = invs.find(i => i.mes_referencia === new Date().getMonth() + 1)?.total || 0;
          return (
            <div key={card.id} onClick={() => setSelectedCardId(card.id)} className="cursor-pointer hover:opacity-90 transition-opacity">
              <CreditCardWidget card={card} limiteInfo={limite} faturaAtual={fatura} compact />
            </div>
          );
        })}
      </div>
    );
  };

  const getCategoryIcon = (categoryId: string | null) => {
    // Mapping icons defaults based on ids if category is custom, fallback to Wallet
    const cat = categoriesList.find(c => c.id === categoryId);
    if (!cat) return Wallet;
    // Map standard icons
    switch (cat.id) {
      case 'food': return Utensils;
      case 'transport': return Car;
      case 'shopping': return ShoppingCart;
      case 'home': return Home;
      case 'entertainment': return Gamepad2;
      case 'coffee': return Coffee;
      case 'work': return Briefcase;
      default: return Wallet;
    }
  };


  return (
    <div className="page-container pb-24">
      {/* Header */}
      <motion.header className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-regular mb-1">Finanças</h1>
      </motion.header>

      {/* Tabs */}
      <motion.div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {[{ id: 'overview', label: 'Visão Geral' }, { id: 'accounts', label: 'Contas', icon: Landmark }, { id: 'transactions', label: 'Transações' }, { id: 'cards', label: 'Cartões', icon: CreditCardIcon }].map(tab => (
          <button key={tab.id} className={`chip flex-shrink-0 ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id as any)}>
            {tab.icon && <tab.icon className="w-4 h-4 mr-1.5" />} {tab.label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <DashboardHeader
              totals={dashboardData.totals}
              privacyMode={privacyMode}
              onTogglePrivacy={() => setPrivacyMode(!privacyMode)}
              currentDate={dashboardDate}
              onDateChange={setDashboardDate}
              onNewTransaction={() => { setEditingTransaction(null); setIsSheetOpen(true); }}
            />

            {/* Chart Section */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-sm font-medium text-muted-foreground">Evolução do Saldo</h3>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="forecast-mode" className={`text-xs ${!showForecast ? 'text-primary font-bold' : 'text-muted-foreground'}`}>Histórico</Label>
                  <Switch id="forecast-mode" checked={showForecast} onCheckedChange={setShowForecast} />
                  <Label htmlFor="forecast-mode" className={`text-xs ${showForecast ? 'text-primary font-bold' : 'text-muted-foreground'}`}>Projeção (90d)</Label>
                </div>
              </div>
              <Suspense fallback={<ChartSkeleton />}>
                <CashFlowChartLazy data={cashFlowData} />
              </Suspense>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <PendingWidget overdueTransactions={dashboardData.overdueTransactions} nextTransactions={dashboardData.nextTransactions} onToggleStatus={toggleStatus} onViewAll={() => setActiveTab("transactions")} privacyMode={privacyMode} />
                <CardsWidget cards={dashboardData.cardSummaries} privacyMode={privacyMode} onViewInvoice={(id) => { setSelectedCardId(id); setActiveTab("cards"); }} />
              </div>
              <div className="bg-card border rounded-2xl p-5 h-auto">
                <Suspense fallback={<CategoryChartSkeleton />}>
                  <CategoryChartLazy data={dashboardData.categoryDistribution} privacyMode={privacyMode} />
                </Suspense>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "transactions" && (
          <motion.div key="transactions" className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {groupedTransactions.length === 0 ? <EmptyState icon={Wallet} title="Sem transações" description="Adicione receitas e despesas." /> : groupedTransactions.map(group => (
              <div key={group.date} className="relative">
                <div className="sticky top-0 bg-background/95 backdrop-blur z-10 py-2 border-b mb-2 flex justify-between items-center">
                  <span className="font-medium text-sm capitalize">{format(parseISO(group.date), "EEE, dd MMM", { locale: ptBR })}</span>
                  {isSameDay(parseISO(group.date), new Date()) && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">Hoje</span>}
                </div>
                <div className="space-y-2">
                  {group.items.map(t => {
                    const Icon = getCategoryIcon(t.category);
                    const isPaid = t.status === 'paid';
                    return (
                      <div key={t.id} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all", isPaid ? "bg-card border-border/50" : "bg-muted/10 border-transparent opacity-80")}>
                        <div onClick={() => toggleStatus(t)} className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer", isPaid ? "bg-green-500/10 border-green-500 text-green-500" : "border-muted-foreground/30 text-transparent")}> <CheckCircle2 className="w-3 h-3" /> </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5"><p className="text-sm font-medium truncate">{t.description}</p>
                            {t.is_installment && <span className="text-[10px] bg-muted px-1 rounded flex items-center"><Layers className="w-2 h-2 mr-0.5" />{t.installment_number}/{t.total_installments}</span>}
                            {t.is_recurring && <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1 rounded flex items-center"><Repeat className="w-2 h-2 mr-0.5" />Fixa</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5"><span className="text-xs text-muted-foreground flex items-center gap-1"><Icon className="w-3 h-3" /> {categoriesList.find(c => c.id === t.category)?.name}</span></div>
                        </div>
                        <div className={cn("text-sm font-medium", t.type === 'income' ? "text-green-500" : "text-red-500")}>
                          {privacyMode ? "R$ •••••" : `${t.type === 'income' ? '+' : '-'} R$ ${Number(t.amount).toFixed(2)}`}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingTransaction({ ...t, date: parseISO(t.transaction_date) }); setIsSheetOpen(true); }}><Pencil className="w-4 h-4 mr-2" />Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteTransaction.mutate(t.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === "cards" && (
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {renderCardView()}
          </motion.div>
        )}

        {activeTab === "accounts" && (
          <motion.div key="accounts" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4 flex gap-2">
              <Button onClick={() => { setEditingAccount(undefined); setIsAccountDialogOpen(true); }} className="flex-1"><Plus className="w-4 h-4 mr-2" />Nova Conta</Button>
              <Button onClick={() => setIsTransferDialogOpen(true)} variant="outline" className="flex-1"><ArrowRightLeft className="w-4 h-4 mr-2" />Transferir</Button>
            </div>
            <AccountsList accounts={activeAccounts} onEdit={(acc) => { setEditingAccount(acc); setIsAccountDialogOpen(true); }} onArchive={(acc) => updateAccount.mutate({ id: acc.id, is_archived: true })} showProjectedBalance={showProjectedBalance} onToggleProjectedBalance={setShowProjectedBalance} />
          </motion.div>
        )}
      </AnimatePresence>

      {(activeTab !== 'cards' || selectedCardId) && (
        <motion.div className="fixed bottom-24 left-5 z-40" initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
          <button className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg glow-lime" onClick={() => { setEditingTransaction(null); setIsSheetOpen(true); }}>
            <Plus className="w-6 h-6" />
          </button>
        </motion.div>
      )}

      {/* Dialogs */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-y-auto">
          <SheetHeader><SheetTitle>{editingTransaction ? "Editar" : "Nova"} Transação</SheetTitle></SheetHeader>
          <TransactionForm onSubmit={editingTransaction ? handleUpdate : handleCreate} onCancel={() => setIsSheetOpen(false)} initialData={editingTransaction} isLoading={isLoading} accounts={activeAccounts} />
        </SheetContent>
      </Sheet>

      <Sheet open={isNewCardOpen} onOpenChange={setIsNewCardOpen}>
        <SheetContent side="bottom" className="h-auto rounded-t-3xl">
          <SheetHeader><SheetTitle>Novo Cartão</SheetTitle></SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Nome do Cartão</Label><Input value={newCardData.nome} onChange={e => setNewCardData({ ...newCardData, nome: e.target.value })} placeholder="Ex: Nubank" /></div>
            <div className="space-y-2"><Label>Limite (R$)</Label><Input type="number" value={newCardData.limite} onChange={e => setNewCardData({ ...newCardData, limite: e.target.value })} placeholder="Ex: 5000" /></div>
            <div className="space-y-2"><Label>Dia Vencimento</Label><Input type="number" min="1" max="31" value={newCardData.dia_vencimento} onChange={e => setNewCardData({ ...newCardData, dia_vencimento: e.target.value })} placeholder="Ex: 10" /></div>
            <Button className="w-full" onClick={handleCreateCard}>Salvar Cartão</Button>
          </div>
        </SheetContent>
      </Sheet>

      <AccountFormDialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen} onSubmit={editingAccount ? handleUpdateAccount : handleCreateAccount} initialData={editingAccount} />
      <TransferDialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen} accounts={activeAccounts} onTransfer={async (data) => {
        const origin = accounts.find(a => a.id === data.originAccountId);
        const dest = accounts.find(a => a.id === data.destinationAccountId);
        if (!origin || !dest) return;
        const [tx1, tx2] = createTransferTransactions(origin, dest, data.amount, format(data.date, "yyyy-MM-dd"), data.description);
        try {
          await createTransaction.mutateAsync({ ...tx1, is_paid: true, status: 'paid' });
          await createTransaction.mutateAsync({ ...tx2, is_paid: true, status: 'paid' });
          toast.success("Transferência realizada!");
        } catch { toast.error("Erro na transferência"); }
      }} />
      <AddTransactionDialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen} cardId={selectedCardId} onAddTransaction={(transactionData) => {
        if (transactionData.is_installment && transactionData.total_installments) {
          const novasTransacoes = gerarTransacoesParceladas({ ...transactionData, user_id: 'user1' }, transactionData.total_installments);
          const transacoesComId = novasTransacoes.map((t, index) => ({ ...t, id: `${Date.now()}-${index}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), user_id: 'user1' }));
          setCreditTransactions([...creditTransactions, ...transacoesComId]);
          toast.success(`Compra parcelada em ${transactionData.total_installments}x adicionada!`);
        } else {
          const novaTransacao: CreditCardTransaction = { ...transactionData, id: Date.now().toString(), is_installment: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), user_id: 'user1' };
          setCreditTransactions([...creditTransactions, novaTransacao]);
          toast.success('Transação adicionada!');
        }
      }} />
      <PayInvoiceDialog
        open={isPayInvoiceOpen}
        onOpenChange={setIsPayInvoiceOpen}
        invoice={selectedInvoice}
        cardName={selectedCard?.nome || ''}
        cardColor={selectedCard?.cor_hex || ''}
        accounts={activeAccounts}
        onConfirmPayment={async (contaId, valor) => {
          try {
            await createTransaction.mutateAsync({
              description: `Pagamento Fatura ${selectedCard?.nome}`,
              amount: valor,
              type: 'expense',
              category: 'others', // Ou criar categoria 'invoice_payment'
              transaction_date: format(new Date(), "yyyy-MM-dd"),
              account_id: contaId,
              is_paid: true,
              status: 'paid',
              is_recurring: false
            });

            // TODO: Aqui deveria vir uma chamada para marcar a fatura como paga no backend
            // Como ainda não temos endpoint específico de "pay_invoice", o saldo da conta será debitado
            // e isso já reflete na realidade financeira do usuário.

            toast.success(`Pagamento de R$ ${valor.toFixed(2)} registrado com sucesso!`);
          } catch (error) {
            console.error(error);
            toast.error("Erro ao registrar pagamento da fatura.");
          }
        }}
      />
    </div>
  );
};

export default Finances;
