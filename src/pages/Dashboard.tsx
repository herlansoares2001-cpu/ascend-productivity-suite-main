import { useState, lazy, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { format, differenceInSeconds, isBefore, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckCircle,
  Wallet,
  Dumbbell,
  Quote,
  Target,
  Plus,
  BookOpen,
  Flame,
  Calendar,
  Zap,
  MoreVertical,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Apple
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { useCalendar } from "@/hooks/useCalendar";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useStreaks } from "@/hooks/useStreaks";
import { supabase } from "@/integrations/supabase/client";
import { UserLevelWidget } from "@/components/gamification/UserLevelWidget";
import { useGamification } from "@/hooks/useGamification";
import { toast } from "sonner";
import { HabitForm } from "@/components/forms/HabitForm";

// --- HELPERS ---
const BentoCard = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 relative overflow-hidden flex flex-col hover:border-white/10 transition-colors cursor-pointer",
      className
    )}
    onClick={onClick}
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
  >
    {children}
  </motion.div>
);

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

// --- DASHBOARD COMPONENT ---
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { habits, createHabit } = useHabits();
  const { getEvents } = useCalendar();
  const { transactions, totalBalance, createTransaction, accounts, refreshData, isLoading: financesLoading, summaryData } = useFinancialData();
  const { streaks } = useStreaks();
  const { awardXP } = useGamification();

  // State
  const [currentBook, setCurrentBook] = useState<any>(null);
  const [isMagicMenuOpen, setIsMagicMenuOpen] = useState(false);
  const [isTxSheetOpen, setIsTxSheetOpen] = useState(false);
  const [isHabitSheetOpen, setIsHabitSheetOpen] = useState(false);

  // 1. Fetch Latest Book (Effect)
  useEffect(() => {
    async function fetchLastBook() {
      if (!user) return;
      const { data } = await supabase.from('books').select('*').order('last_read_at', { ascending: false }).limit(1).single();
      if (data) setCurrentBook(data);
    }
    fetchLastBook();
  }, [user]);

  // 2. Data Calculation
  // Focus Now Logic
  const todayEvents = getEvents(new Date());
  const nextEvent = todayEvents.find(e => isBefore(new Date(), e.endTime) && isSameDay(e.startTime, new Date()));

  // Behavior Logic
  const completedHabits = habits.filter(h => h.completed).length;
  const bestStreak = streaks.sort((a, b) => {
    const durA = differenceInSeconds(new Date(), new Date(a.last_relapse_date));
    const durB = differenceInSeconds(new Date(), new Date(b.last_relapse_date));
    return durB - durA;
  })[0];
  const bestStreakDays = bestStreak ? Math.floor(differenceInSeconds(new Date(), new Date(bestStreak.last_relapse_date)) / 86400) : 0;

  // Finance Logic
  const spentToday = transactions
    .filter(t => isSameDay(new Date(t.transaction_date), new Date()))
    .reduce((acc, t) => t.type === 'expense' ? acc + t.amount : acc, 0);

  // Handlers
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

      if (data.account_id) saveTransactionAccount(newTx.id, data.account_id);
      refreshData();

      toast.success("Transação adicionada!");
      awardXP(15, "Transação Rápida");
      setIsTxSheetOpen(false);
    } catch (e) {
      toast.error("Erro ao criar transação");
    }
  };

  const handleCreateHabit = async (data: any) => {
    await createHabit.mutateAsync(data);
    setIsHabitSheetOpen(false);
  };


  return (
    <div className="page-container pb-28 pt-6 space-y-6">

      {/* 1. Header */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-400 font-light ml-1">Dashboard</p>
          {user && (
            <h1 className="text-3xl font-regular">{getGreeting()}, <span className="font-semibold text-white">{user.email?.split('@')[0]}</span></h1>
          )}
        </div>
        <UserLevelWidget />
      </header>

      {/* 2. Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Widget: Focus Now (Wide) */}
        <BentoCard className="md:col-span-2 bg-[#D4F657]/5 border-[#D4F657]/20" onClick={() => navigate('/calendar')}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 text-[#D4F657]">
              <Target className="w-5 h-5" />
              <span className="font-semibold tracking-wide uppercase text-xs">Foco Agora</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </div>

          {nextEvent ? (
            <div>
              <h3 className="text-2xl font-medium mb-1 line-clamp-1">{nextEvent.title}</h3>
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar className="w-4 h-4" />
                <span>{format(nextEvent.startTime, 'HH:mm')} - {format(nextEvent.endTime, 'HH:mm')}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center h-full min-h-[80px]">
              <Quote className="w-6 h-6 text-zinc-600 mb-2" />
              <p className="text-zinc-300 italic">"A consistência é a chave para o extraordinário."</p>
            </div>
          )}
        </BentoCard>

        {/* Widget: Current Reading (Square) */}
        <BentoCard className="md:col-span-1" onClick={() => navigate('/books')}>
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg"><BookOpen className="w-5 h-5 text-blue-400" /></div>
            <span className="text-xs text-zinc-500 font-mono">LENDO</span>
          </div>

          {currentBook ? (
            <div className="flex flex-col h-full justify-end">
              <h4 className="font-medium line-clamp-1">{currentBook.title}</h4>
              <div className="flex justify-between text-xs text-zinc-400 mt-1 mb-2">
                <span>Pág {currentBook.current_page}</span>
                <span>{Math.round((currentBook.current_page / currentBook.total_pages) * 100)}%</span>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 w-1/2" style={{ width: `${(currentBook.current_page / currentBook.total_pages) * 100}%` }} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
              <span className="text-sm">Nenhuma leitura</span>
              <Button variant="outline" size="sm" className="h-7 text-xs">Escolher Livro</Button>
            </div>
          )}
        </BentoCard>

        {/* Widget: Behavior (Wide) */}
        <BentoCard className="md:col-span-2" onClick={() => navigate('/habits')}>
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-semibold text-zinc-500 tracking-wider">COMPORTAMENTO</span>
          </div>
          <div className="flex gap-8 items-end">
            <div className="flex-1">
              <div className="text-3xl font-light mb-1">{completedHabits}<span className="text-zinc-500 text-lg">/{habits.length}</span></div>
              <p className="text-xs text-zinc-400">Hábitos hoje</p>
              <div className="flex gap-1 mt-3">
                {habits.slice(0, 6).map((h, i) => (
                  <div key={i} className={cn("h-1 flex-1 rounded-full", h.completed ? "bg-[#D4F657]" : "bg-zinc-800")} />
                ))}
              </div>
            </div>

            {bestStreak && (
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-[#D4F657] mb-1">
                  <Flame className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold uppercase">Melhor Streak</span>
                </div>
                <div className="text-3xl font-semibold">{bestStreakDays} <span className="text-sm font-normal text-zinc-500">dias</span></div>
                <p className="text-xs text-zinc-400 max-w-[100px] truncate ml-auto">{bestStreak.title}</p>
              </div>
            )}
          </div>
        </BentoCard>

        {/* Widget: Tactical Finance (Square) */}
        <BentoCard className="md:col-span-1" onClick={() => navigate('/finances')}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg"><Wallet className="w-5 h-5 text-emerald-400" /></div>
            <span className="text-xs text-zinc-500 font-mono">CARTEIRA</span>
          </div>
          <div className="mt-auto">
            <p className="text-xs text-zinc-400 mb-1">Saldo Atual</p>
            <div className="text-2xl font-medium tracking-tight mb-4">
              {financesLoading ? <Skeleton className="h-8 w-24" /> : `R$ ${totalBalance.toLocaleString('pt-BR', { notation: 'compact' })}`}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-xs text-zinc-400">Gasto Hoje</span>
              <span className="text-xs font-medium text-red-400">- R$ {spentToday.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </BentoCard>

        {/* Widget: Health (Compact) */}
        <BentoCard className="md:col-start-1 md:col-end-3" onClick={() => navigate('/workout')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-500/10 rounded-full"><Dumbbell className="w-5 h-5 text-orange-400" /></div>
              <div>
                <p className="text-sm font-medium">Treino de Hoje</p>
                <p className="text-xs text-zinc-400">Costas e Bíceps (Previsto)</p>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-white/10 mx-4" />
            <div className="flex items-center gap-4 flex-1">
              <div className="p-2 bg-pink-500/10 rounded-full"><Apple className="w-5 h-5 text-pink-400" /></div>
              <div>
                <p className="text-sm font-medium">Dieta</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-400 w-[60%]" />
                  </div>
                  <span className="text-xs text-zinc-400">1200/2000 kcal</span>
                </div>
              </div>
            </div>
          </div>
        </BentoCard>

      </div>

      {/* 3. Magic Action Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <AnimatePresence>
          {isMagicMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 flex flex-col gap-2 items-end mb-2"
            >
              <Button onClick={() => { navigate('/calendar'); setIsMagicMenuOpen(false); }} className="bg-zinc-800 text-white border border-white/10 rounded-full px-4">+ Evento</Button>
              <Button onClick={() => { setIsHabitSheetOpen(true); setIsMagicMenuOpen(false); }} className="bg-zinc-800 text-white border border-white/10 rounded-full px-4">+ Hábito</Button>
              <Button onClick={() => { setIsTxSheetOpen(true); setIsMagicMenuOpen(false); }} className="bg-zinc-800 text-white border border-white/10 rounded-full px-4">+ Transação</Button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMagicMenuOpen(!isMagicMenuOpen)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-[#D4F657]/20 transition-all",
            isMagicMenuOpen ? "bg-white text-black rotate-45" : "bg-[#D4F657] text-black"
          )}
        >
          <Plus className="w-7 h-7 stroke-[3px]" />
        </motion.button>
      </div>

      {/* Sheets */}
      <Sheet open={isTxSheetOpen} onOpenChange={setIsTxSheetOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[90vh] rounded-t-3xl overflow-y-auto">
          <SheetHeader className="mb-4"><SheetTitle>Nova Transação</SheetTitle></SheetHeader>
          <TransactionForm onSubmit={handleCreateTransaction} onCancel={() => setIsTxSheetOpen(false)} isLoading={financesLoading} accounts={accounts} />
        </SheetContent>
      </Sheet>

      <Sheet open={isHabitSheetOpen} onOpenChange={setIsHabitSheetOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[90vh] rounded-t-3xl overflow-y-auto">
          <SheetHeader className="mb-4"><SheetTitle>Novo Hábito</SheetTitle></SheetHeader>
          <HabitForm onSubmit={handleCreateHabit} onCancel={() => setIsHabitSheetOpen(false)} isLoading={false} />
        </SheetContent>
      </Sheet>

    </div>
  );
};

export default Dashboard;
