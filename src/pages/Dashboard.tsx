import { useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle, Wallet, Dumbbell, BookOpen, Target, Plus, TrendingUp } from "lucide-react";
import { KPICard } from "@/components/widgets/KPICard";
import { WeeklyCalendar } from "@/components/widgets/WeeklyCalendar";
import { TaskListWidget } from "@/components/widgets/TaskListWidget";
import { PomodoroWidget } from "@/components/widgets/PomodoroWidget";
import { QuickNotesWidget } from "@/components/widgets/QuickNotesWidget";
import { RemindersWidget } from "@/components/widgets/RemindersWidget";
import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { useCalendar } from "@/hooks/useCalendar";
import { useFinancialData } from "@/hooks/useFinancialData";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { toast } from "sonner";
import { format } from "date-fns";
import { saveTransactionMeta, saveTransactionAccount } from "@/services/finance-storage";
import { UserLevelWidget } from "@/components/gamification/UserLevelWidget";
import { useGamification } from "@/hooks/useGamification";
import { ChartSkeleton, CategoryChartSkeleton } from "@/components/finances/ChartSkeletons";
import { calculateHistoricalCashFlow } from "@/core/finance/forecasting-engine";
import { getDashboardSummary } from "@/core/finance/dashboard-engine";

// Lazy Loaded Components
const CashFlowChart = lazy(() => import("@/components/finances/CashFlowChart").then(m => ({ default: m.CashFlowChart })));
const CategoryChart = lazy(() => import("@/components/finances/dashboard/CategoryChart").then(m => ({ default: m.CategoryChart })));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

const Dashboard = () => {
  const { user } = useAuth();
  const { habits } = useHabits();
  const { getEvents } = useCalendar();
  const { transactions, totalBalance, createTransaction, accounts, refreshData, isLoading } = useFinancialData();
  const { awardXP } = useGamification();
  const [isTxSheetOpen, setIsTxSheetOpen] = useState(false);

  // Derivando dados financeiros para os novos widgets
  const cashFlowData = calculateHistoricalCashFlow(totalBalance, transactions, 7);
  const dashboardData = getDashboardSummary(transactions, accounts, [], [], new Date());

  const completedHabits = habits.filter(h => h.completed).length;

  const todayEvents = getEvents(new Date()).map(evt => ({
    id: evt.id,
    title: evt.title,
    time: evt.startTime,
    location: evt.type === 'habit' ? 'Hábito' : 'Evento'
  }));

  const handleCreateTransaction = async (data: any) => {
    try {
      const newTx: any = await createTransaction.mutateAsync({
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        transaction_date: format(data.date, "yyyy-MM-dd"),
        is_paid: data.status === 'paid',
        status: data.status || 'paid',
        is_recurring: data.is_recurring || false
      });

      if (newTx?.id) {
        if (data.account_id) saveTransactionAccount(newTx.id, data.account_id);
        saveTransactionMeta(newTx.id, {
          status: data.status,
          is_recurring: data.is_recurring,
        });
        refreshData();
      }

      toast.success("Transação adicionada!");
      awardXP(15, "Transação Rápida");
      setIsTxSheetOpen(false);
    } catch (e) {
      toast.error("Erro ao criar transação");
    }
  };

  return (
    <div className="page-container pb-24">
      <motion.header
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <p className="text-sm text-muted-foreground font-light">Olá,</p>
          <h1 className="text-2xl font-regular">{getGreeting()}, {user?.email?.split('@')[0]}!</h1>
        </div>
        <Link to="/profile">
          <motion.div whileTap={{ scale: 0.95 }}>
            <UserLevelWidget />
          </motion.div>
        </Link>
      </motion.header>

      <motion.div
        className="space-y-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.section variants={itemVariants}>
          <h2 className="section-title"><span>Overview</span></h2>
          <div className="grid grid-cols-2 gap-3">
            <KPICard icon={CheckCircle} label="Hábitos" value={`${completedHabits}/${habits.length} concluídos`} color="lime" to="/habits" />
            <KPICard
              icon={Wallet}
              label="Finanças"
              value={`R$ ${totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              subValue="Saldo atual"
              color="green"
              to="/finances"
            />
            <KPICard icon={Dumbbell} label="Treino/Dieta" value="1.850 kcal" subValue="Consumidas hoje" color="orange" to="/workout" />
            <KPICard icon={BookOpen} label="Leituras" value="30 páginas" subValue="Meta de hoje" color="blue" to="/books" />
            <div className="col-span-2">
              <KPICard icon={Target} label="Metas 2026" value="35% progresso total" subValue="3 de 8 metas em andamento" color="lime" to="/goals" />
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants}>
          <WeeklyCalendar appointments={todayEvents} />
        </motion.section>

        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="section-title mb-0"><span>Métricas Financeiras</span></h2>
            <Link to="/finances" className="text-xs text-primary flex items-center gap-1">Ver detalhes <TrendingUp className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-4">
            <Suspense fallback={<ChartSkeleton />}>
              <CashFlowChart data={cashFlowData} />
            </Suspense>
            <div className="bg-card border rounded-2xl p-5">
              <Suspense fallback={<CategoryChartSkeleton />}>
                <CategoryChart data={dashboardData.categoryDistribution} privacyMode={false} />
              </Suspense>
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 className="section-title"><span>Produtividade</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TaskListWidget />
            <PomodoroWidget />
          </div>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 className="section-title"><span>Captura Rápida</span></h2>
          <div className="grid grid-cols-1 gap-4">
            <QuickNotesWidget />
            <RemindersWidget />
          </div>
        </motion.section>
      </motion.div>

      <motion.div className="fixed bottom-24 left-5 z-40" initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
        <button className="w-14 h-14 rounded-full bg-primary text-primary-foreground hover:brightness-110 flex items-center justify-center shadow-lg shadow-primary/30" onClick={() => setIsTxSheetOpen(true)}>
          <Plus className="w-6 h-6" />
        </button>
      </motion.div>

      <Sheet open={isTxSheetOpen} onOpenChange={setIsTxSheetOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[90vh] rounded-t-3xl overflow-y-auto">
          <SheetHeader className="mb-4"><SheetTitle>Nova Transação Rápida</SheetTitle></SheetHeader>
          <TransactionForm onSubmit={handleCreateTransaction} onCancel={() => setIsTxSheetOpen(false)} isLoading={isLoading} accounts={accounts} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Dashboard;
