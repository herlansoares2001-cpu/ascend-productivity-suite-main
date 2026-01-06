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
  BookOpen,
  ListTodo,
  TrendingDown,
  TrendingUp,
  CreditCard,
  User
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
import { RemindersWidget } from "@/components/widgets/RemindersWidget";
import { WeeklyCalendar } from "@/components/widgets/WeeklyCalendar";
import { FinanceWidget } from "@/components/widgets/FinanceWidget";
import { GoalsWidget } from "@/components/widgets/GoalsWidget";
import { StreakCounter } from "@/components/streaks/StreakCounter";
import { QuickActionFab } from "@/components/dashboard/QuickActionFab";

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

const DailyBriefingHeader = ({ name, summary, onProfileClick }: { name: string; summary: string; onProfileClick: () => void }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="flex items-start justify-between mb-8 px-1">
      <div className="flex flex-col gap-1">
        {/* 1. Large Direct Greeting */}
        <h1 className="text-3xl md:text-5xl font-light text-white tracking-tight">
          {greeting}, <span className="font-regular text-[#EBFF57]">{name}</span>.
        </h1>

        {/* 2. Concise AI Briefing (Subtitle) */}
        <div className="flex items-center gap-2 mt-2">
          <Sparkles className="w-4 h-4 text-[#EBFF57]" />
          <p className="text-zinc-400 font-light text-sm md:text-base">
            {summary || "Pronto para organizar sua vida hoje?"}
          </p>
        </div>
      </div>

      {/* Profile Icon */}
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-white/5 transition-colors hidden md:flex"
        onClick={onProfileClick}
      >
        <User className="w-6 h-6 text-[#EBFF57]" />
      </Button>
    </div>
  );
};

// --- REAL GOALS MOCK ---
const goalsMock = [
  { id: "1", title: "Economizar R$50.000", progress: 35, deadline: "Dez 2026" },
  { id: "2", title: "Ler 24 livros", progress: 50, deadline: "Dez 2026" }
];

// --- DASHBOARD COMPONENT ---
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
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Dynamic AI Summary State
  const [aiSummary, setAiSummary] = useState<string>("");

  useEffect(() => {
    // Try to get summary from localStorage or set default
    const savedSummary = localStorage.getItem('ascend_ai_summary');
    if (savedSummary) {
      setAiSummary(savedSummary);
    } else {
      setAiSummary("Seus dados foram resetados. Comece a cadastrar hábitos para gerar novos insights.");
    }
  }, []);

  // 1. Fetch Data
  useEffect(() => {
    async function fetchLastBook() {
      if (!user) return;
      const { data } = await supabase.from('books').select('*').order('last_read_at', { ascending: false }).limit(1).maybeSingle();
      if (data) setCurrentBook(data);
    }
    fetchLastBook();
  }, [user]);

  // --- LOCAL DATA SYNC (Goals, Workout, Diet) ---
  const [localGoals, setLocalGoals] = useState<any[]>([]);
  const [lastWorkout, setLastWorkout] = useState<any>(null);
  const [dietSummary, setDietSummary] = useState<{ calories: number; label: string }>({ calories: 0, label: '0 kcal' });

  useEffect(() => {
    const syncLocalData = () => {
      // Goals
      const savedGoals = localStorage.getItem('ascend_goals');
      if (savedGoals) {
        setLocalGoals(JSON.parse(savedGoals));
      }

      // Workout
      const savedWorkouts = localStorage.getItem('ascend_workouts');
      if (savedWorkouts) {
        const parsedWorkouts = JSON.parse(savedWorkouts);
        if (parsedWorkouts.length > 0) {
          setLastWorkout(parsedWorkouts[0]); // Most recent is first
        }
      }

      // Diet
      const savedMeals = localStorage.getItem('ascend_meals');
      if (savedMeals) {
        const meals: any[] = JSON.parse(savedMeals);
        const totalCals = meals.reduce((acc, m) => acc + (m.calories || 0), 0);
        setDietSummary({ calories: totalCals, label: `${totalCals} kcal` });
      }
    };

    syncLocalData();

    // Listen for storage changes (cross-tab) or custom events if we dispatch them
    // For simplicity, we just run once here. To make it real-time within the same tab, 
    // we rely on the user navigating back to dashboard which re-mounts component.
    // Or we could set an interval.
    const interval = setInterval(syncLocalData, 2000); // Polling every 2s to check updates
    return () => clearInterval(interval);

  }, []);

  // 2. Logic
  const todayEvents = getEvents(selectedDate);
  const formattedAppointments = todayEvents.map(evt => {
    let timeStr = '--:--';
    try {
      if (evt.startTime) {
        const date = new Date(evt.startTime);
        if (!isNaN(date.getTime())) {
          timeStr = format(date, 'HH:mm');
        }
      }
    } catch (e) {
      console.error("Date format error", evt);
    }

    return {
      id: evt.id,
      title: evt.title,
      time: timeStr,
      location: evt.category || 'Pessoal'
    };
  });

  const mainStreak = streaks.length > 0 ? streaks[0] : null;

  const spentToday = transactions
    .filter(t => isSameDay(new Date(t.transaction_date), new Date()))
    .reduce((acc, t) => t.type === 'expense' ? acc + t.amount : acc, 0);

  // Get full name if available, else username
  const fullName = user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
    : user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="page-container max-w-[1600px] margin-0-auto pt-8 pb-12 space-y-6">

      {/* 1. Header: AI Daily Briefing */}
      <DailyBriefingHeader name={fullName} summary={aiSummary} onProfileClick={() => navigate('/profile')} />

      {/* 2. Top Section: Daily Overview (Habits + Weekly Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Habits Widget (Top Importance) */}
        <div className="lg:col-span-4 h-full">
          <BentoCard onClick={() => navigate('/habits')} className="h-full border-primary/30 bg-primary/5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-widest">HÁBITOS DIÁRIOS</span>
              </div>
              <span className="text-xs text-foreground font-medium bg-primary/10 px-2 py-1 rounded-full">{habits.filter(h => h.completed).length}/{habits.length}</span>
            </div>
            <div className="space-y-3">
              {habits.slice(0, 5).map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0",
                    h.completed ? "bg-primary border-primary" : "border-border bg-transparent"
                  )}>
                    {h.completed && <Check className="w-3 h-3 text-black" />}
                  </div>
                  <span className={cn("text-sm font-medium truncate", h.completed ? "text-zinc-500 line-through" : "text-foreground")}>
                    {h.name || h.title || "Novo Hábito"}
                  </span>
                </div>
              ))}
            </div>
          </BentoCard>
        </div>

        {/* Weekly Calendar & Next Event */}
        <div className="lg:col-span-8 h-full">
          <WeeklyCalendar
            appointments={formattedAppointments}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

      </div>

      {/* 3. Middle Section: Finances (Enhanced Focus) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BentoCard onClick={() => navigate('/finances')} className="bg-gradient-to-br from-emerald-900/20 to-transparent border-emerald-500/30 col-span-1 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg"><Wallet className="w-6 h-6 text-emerald-400" /></div>
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">SALDO TOTAL</h3>
          </div>
          <p className={cn("text-4xl md:text-5xl font-light tracking-tight", totalBalance >= 0 ? "text-foreground" : "text-red-400")}>
            R$ {totalBalance.toLocaleString('pt-BR', { notation: 'compact' })}
          </p>
          <p className="text-sm text-muted-foreground mt-2">Disponível para uso imediato</p>
        </BentoCard>

        <div className="bg-card/50 border border-border/50 rounded-3xl p-6 md:col-span-2 cursor-pointer hover:bg-card/40 transition-colors" onClick={() => navigate('/finances')}>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Controle Diário</h3>
          <FinanceWidget
            todaySpent={spentToday}
            dailyBudget={user?.user_metadata?.daily_budget || 0}
          />
          <div className="flex gap-4 mt-6 pt-6 border-t border-border/50">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Próxima Fatura</p>
              <div className="flex items-center gap-2 mt-1">
                <CreditCard className="w-4 h-4 text-purple-400" />
                <span className="text-lg text-foreground">R$ 0,00</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Economia Mensal</p>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-lg text-foreground">0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Secondary Info (Less Emphasis) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-80 hover:opacity-100 transition-opacity duration-500">

        {/* Goals Compact - Centered & Padded */}
        <div
          className="lg:col-span-1 bg-card/50 border border-border/50 rounded-3xl p-5 min-h-[140px] relative grayscale hover:grayscale-0 transition-all flex flex-col justify-start cursor-pointer hover:bg-card/50"
          onClick={() => navigate('/goals')}
        >
          <GoalsWidget goals={localGoals} />
        </div>

        {/* Reminders - Top Aligned & Reduced Height */}
        <div
          className="lg:col-span-1 bg-card/50 border border-border/50 rounded-3xl overflow-hidden p-5 min-h-[140px] flex flex-col justify-start cursor-pointer hover:bg-card/50"
          onClick={() => navigate('/calendar')}
        >
          <RemindersWidget />
        </div>

        {/* Notes - Top Aligned & Reduced Height */}
        <div
          className="lg:col-span-1 bg-card/50 border border-border/50 rounded-3xl overflow-hidden min-h-[140px] p-5 flex flex-col justify-start cursor-pointer hover:bg-card/50"
          onClick={() => navigate('/notes')} // Redirecting to notes
        >
          <QuickNotesWidget />
        </div>

        {/* Health Stack - With Diet & Improved Streak */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <BentoCard className="p-0 overflow-hidden divide-y divide-white/5 bg-card/20 border border-white/5">
            {/* Workout Side */}
            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/workout')}>
              <div className="flex items-center gap-3">
                <Dumbbell className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">TREINO</p>
                  <p className="text-sm font-medium text-white truncate max-w-[120px]">
                    {lastWorkout ? lastWorkout.name : "Sem treino hoje"}
                  </p>
                </div>
              </div>
            </div>

            {/* Diet Side */}
            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/diet')}>
              <div className="flex items-center gap-3">
                <Apple className="w-5 h-5 text-pink-400" />
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">DIETA</p>
                  <p className="text-sm font-medium text-white">
                    {dietSummary.label}
                  </p>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Streak - Full Width */}
          {mainStreak ? (
            <div className="w-full">
              <StreakCounter streak={mainStreak} onReset={resetStreak.mutate} onDelete={deleteStreak.mutate} />
            </div>
          ) : (
            <div className="bg-card/20 rounded-2xl p-4 border border-white/5 text-center">
              <p className="text-xs text-zinc-500">Sem Abstinências Ativas</p>
            </div>
          )}
        </div>      </div>

      <QuickActionFab />
    </div>
  );
};

export default Dashboard;
