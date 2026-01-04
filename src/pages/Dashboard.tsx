import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format, differenceInSeconds, isBefore, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Target,
  Sparkles,
  Dumbbell,
  Wallet,
  Calendar as CalendarIcon,
  Flame,
  Apple,
  Check,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { useCalendar } from "@/hooks/useCalendar";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useStreaks } from "@/hooks/useStreaks";
import { supabase } from "@/integrations/supabase/client";
import { TaskListWidget } from "@/components/widgets/TaskListWidget";
import { QuickNotesWidget } from "@/components/widgets/QuickNotesWidget";
import Goals from "@/pages/Goals";
import { StreakCounter } from "@/components/streaks/StreakCounter";

// --- HELPERS ---
const BentoCard = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={cn(
      "bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 relative overflow-hidden flex flex-col transition-all duration-300",
      onClick && "cursor-pointer hover:border-white/10 hover:bg-card/50",
      className
    )}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

const DailyBriefingHeader = ({ name }: { name: string }) => {
  // Logic simulated for now
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="flex flex-col gap-2 mb-8 px-1">
      <div className="flex items-center gap-2 text-[#EBFF57] animate-pulse-glow">
        <Sparkles className="w-5 h-5" />
        <span className="text-xs font-semibold tracking-widest uppercase">AI Daily Briefing</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-light leading-tight max-w-2xl text-white">
        <span className="text-zinc-500">{greeting}, {name}.</span> Hoje o foco é total: você tem o Treino B, 3 tarefas prioritárias e sua meta financeira está em dia. <span className="text-white font-normal">Vamos esmagar!</span>
      </h1>
    </div>
  );
};

// --- DASHBOARD COMPONENT ---
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { habits } = useHabits();
  const { getEvents } = useCalendar();
  const { transactions, totalBalance, isLoading: financesLoading } = useFinancialData();
  const { streaks, resetStreak, deleteStreak } = useStreaks();

  // State
  const [currentBook, setCurrentBook] = useState<any>(null);

  // 1. Fetch Data
  useEffect(() => {
    async function fetchLastBook() {
      if (!user) return;
      const { data } = await supabase.from('books').select('*').order('last_read_at', { ascending: false }).limit(1).single();
      if (data) setCurrentBook(data);
    }
    fetchLastBook();
  }, [user]);

  // 2. Logic
  const todayEvents = getEvents(new Date());
  const nextEvent = todayEvents.find(e => isBefore(new Date(), e.endTime) && isSameDay(e.startTime, new Date()));
  const mainStreak = streaks.length > 0 ? streaks[0] : null;

  const spentToday = transactions
    .filter(t => isSameDay(new Date(t.transaction_date), new Date()))
    .reduce((acc, t) => t.type === 'expense' ? acc + t.amount : acc, 0);

  return (
    <div className="page-container max-w-[1600px] margin-0-auto pt-8 pb-12 space-y-8">

      {/* 1. Header: The Brain */}
      <DailyBriefingHeader name={user?.email?.split('@')[0] || 'User'} />

      {/* 2. Cockpit Grid (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-min">

        {/* === COLUMN 1: ESTRATÉGIA (Strategy) === */}
        <div className="flex flex-col gap-6">
          <h3 className="text-sm text-zinc-500 font-medium ml-2">ESTRATÉGIA</h3>

          {/* Goal Widget (Imported Logic Wrapper) */}
          <div className="bg-card/20 border border-white/5 rounded-3xl p-1 h-[400px] overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto no-scrollbar mask-gradient-b">
              <Goals /> {/* Reusing the Goals Page Component but constrained container */}
            </div>
          </div>

          {/* Finance Compact */}
          <div className="grid grid-cols-2 gap-4">
            <BentoCard onClick={() => navigate('/finances')} className="bg-gradient-to-br from-emerald-900/10 to-transparent border-emerald-500/20">
              <p className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase mb-2">SALDO DISPONÍVEL</p>
              <p className={`text-2xl font-light ${totalBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
                R$ {totalBalance.toLocaleString('pt-BR', { notation: 'compact' })}
              </p>
            </BentoCard>

            <BentoCard onClick={() => navigate('/finances')}>
              <p className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mb-2">GASTO HOJE</p>
              <p className="text-xl font-light text-red-400">
                -R$ {spentToday.toLocaleString('pt-BR', { notation: 'compact' })}
              </p>
              <p className="text-[10px] text-zinc-600 mt-1">Limite diário: R$ 200</p>
            </BentoCard>
          </div>
        </div>

        {/* === COLUMN 2: EXECUÇÃO (Execution - Wide Center) === */}
        <div className="flex flex-col gap-6">
          <h3 className="text-sm text-zinc-500 font-medium ml-2">EXECUÇÃO</h3>

          {/* Focus Block */}
          <BentoCard onClick={() => navigate('/calendar')} className="border-[#EBFF57]/30 bg-[#EBFF57]/5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#EBFF57] animate-pulse" />
                <span className="text-xs font-bold text-[#EBFF57] tracking-widest uppercase">AGORA</span>
              </div>
              <span className="text-xs text-zinc-500">{format(new Date(), 'EEEE, d MMM', { locale: ptBR })}</span>
            </div>

            {nextEvent ? (
              <div className="mt-2">
                <h2 className="text-3xl font-light text-white mb-2">{nextEvent.title}</h2>
                <div className="flex items-center gap-2 text-zinc-400">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="text-lg font-light">{format(nextEvent.startTime, 'HH:mm')} - {format(nextEvent.endTime, 'HH:mm')}</span>
                </div>
              </div>
            ) : (
              <div className="mt-2 py-4">
                <h2 className="text-2xl font-light text-zinc-400">Tempo livre</h2>
                <p className="text-sm text-zinc-600 mt-1">Aproveite para adiantar tarefas ou descansar.</p>
              </div>
            )}
          </BentoCard>

          {/* Task List */}
          <div className="bg-card/30 border border-white/5 rounded-3xl overflow-hidden min-h-[300px]">
            <TaskListWidget />
          </div>

          {/* Quick Notes */}
          <div className="bg-card/30 border border-white/5 rounded-3xl overflow-hidden h-48">
            <QuickNotesWidget />
          </div>
        </div>

        {/* === COLUMN 3: CORPO & MENTE (Health) === */}
        <div className="flex flex-col gap-6">
          <h3 className="text-sm text-zinc-500 font-medium ml-2">CORPO & MENTE</h3>

          {/* Bio-Data Card */}
          <BentoCard className="p-0 overflow-hidden divide-y divide-white/5">
            {/* Workout Side */}
            <div className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/workout')}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg"><Dumbbell className="w-5 h-5 text-orange-400" /></div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">TREINO DE HOJE</p>
                  <p className="text-sm font-medium text-white">Superior B (Costas)</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full border border-white/10 hover:bg-[#EBFF57]/20 hover:text-[#EBFF57]">
                <Check className="w-4 h-4" />
              </Button>
            </div>

            {/* Diet Side */}
            <div className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/diet')}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/10 rounded-lg"><Apple className="w-5 h-5 text-pink-400" /></div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">DIETA</p>
                  <p className="text-sm font-medium text-white">1.250 / 2.500 kcal</p>
                </div>
              </div>
              <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-pink-400 w-1/2" />
              </div>
            </div>
          </BentoCard>

          {/* Habits & Vices */}
          <div className="space-y-4">
            {/* Main Streak */}
            {mainStreak ? (
              <StreakCounter
                streak={mainStreak}
                onReset={resetStreak.mutate}
                onDelete={deleteStreak.mutate}
              />
            ) : (
              <BentoCard className="border-dashed border-zinc-800 flex items-center justify-center p-8">
                <p className="text-zinc-500 text-sm">Nenhum Vício Monitorado</p>
              </BentoCard>
            )}

            {/* Compact Habits */}
            <BentoCard onClick={() => navigate('/habits')}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">HÁBITOS DIÁRIOS</span>
                <span className="text-xs text-white">{habits.filter(h => h.completed).length}/{habits.length}</span>
              </div>
              <div className="flex gap-2 justify-between">
                {habits.slice(0, 5).map((h, i) => (
                  <div key={i} title={h.title} className={cn(
                    "h-2 flex-1 rounded-full transition-all",
                    h.completed ? "bg-[#EBFF57] shadow-[0_0_10px_rgba(235,255,87,0.3)]" : "bg-zinc-800"
                  )} />
                ))}
              </div>
            </BentoCard>
          </div>

          {/* Current Book Mini */}
          <BentoCard onClick={() => navigate('/books')} className="flex-row gap-4 items-center">
            <div className="h-12 w-9 bg-zinc-800 rounded flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">LENDO AGORA</p>
              <p className="text-sm text-white truncate">{currentBook ? currentBook.title : "Nenhuma leitura"}</p>
            </div>
          </BentoCard>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
