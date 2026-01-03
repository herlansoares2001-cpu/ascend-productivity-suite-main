import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Flame,
  Plus,
  Calendar,
  MoreVertical,
  Trash2,
  Clock
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HabitForm } from "@/components/forms/HabitForm";
import { useHabits, Habit } from "@/hooks/useHabits";
import { getHabitCategories } from "@/lib/habit-storage";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useGamification } from "@/hooks/useGamification";

const Habits = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);

  const { habits, streak, isLoading, createHabit, toggleHabit, deleteHabit } = useHabits();
  const { awardXP } = useGamification();
  const categories = getHabitCategories(); // Fetch latest categories

  const completedCount = habits.filter(h => h.completed).length;
  const completionRate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  // Chart Data
  const categoryData = categories.map(cat => {
    const count = habits.filter(h => h.category === cat.id).length;
    return { name: cat.name, value: count, color: cat.color };
  }).filter(d => d.value > 0);

  const handleCreate = async (data: any) => {
    try {
      await createHabit.mutateAsync(data);
      setIsSheetOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHabit.mutateAsync(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggle = async (habit: Habit) => {
    try {
      await toggleHabit.mutateAsync(habit);
      if (!habit.completed) {
        awardXP(10, "Hábito Concluído");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openCreate = () => {
    setEditingHabit(null);
    setIsSheetOpen(true);
  };

  const getCategoryColor = (catId?: string) => {
    return categories.find(c => c.id === catId)?.color || "#95A5A6";
  };

  const getCategoryName = (catId?: string) => {
    return categories.find(c => c.id === catId)?.name || "Geral";
  };

  return (
    <div className="page-container pb-28">
      <motion.header className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-regular mb-1">Hábitos</h1>
            <p className="text-sm text-muted-foreground font-light">Construa uma rotina consistente</p>
          </div>
        </div>
      </motion.header>

      {/* Dashboard Grid */}
      <motion.div className="grid grid-cols-2 gap-4 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {/* Streak Card */}
        <div className="widget-card widget-card-lime">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-light opacity-80">Streak</span>
          </div>
          <p className="text-4xl font-regular">{streak}</p>
          <p className="text-xs font-light opacity-70">dias seguidos</p>
        </div>

        {/* Completion Card */}
        <div className="widget-card relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-light text-muted-foreground">Hoje</span>
            </div>
            <p className="text-4xl font-regular">{completedCount}/{habits.length}</p>
            <p className="text-xs font-light text-muted-foreground">{completionRate}% completo</p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
            <Circle className="w-32 h-32" />
          </div>
        </div>
      </motion.div>

      {/* Categories Chart Section */}
      {categoryData.length > 0 && (
        <motion.div className="widget-card mb-6 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="text-sm font-medium mb-4">Distribuição por Categoria</h3>
          <div className="h-[120px] flex items-center">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={2} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {categoryData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-medium ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-regular">Sua Lista</h2>
        <motion.button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20" whileTap={{ scale: 0.9 }} onClick={openCreate}>
          <Plus className="w-5 h-5 text-primary-foreground" />
        </motion.button>
      </div>

      {habits.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="Nenhum hábito" description="Adicione hábitos para começar." action={<motion.button className="px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm" whileTap={{ scale: 0.95 }} onClick={openCreate}>Adicionar Hábito</motion.button>} />
      ) : (
        <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AnimatePresence>
            {habits.map((habit) => {
              const catColor = getCategoryColor(habit.category);
              const target = habit.todayFrequency || 1;
              const progressPercent = Math.min((habit.currentProgress / target) * 100, 100);
              const isMultiFreq = target > 1;

              // Hide if frequency today is 0?
              // If schedule says today is inactive, we should technically not show it or show as "Day Off".
              // showing as disabled/dimmed might be good context.
              const isInactiveToday = target === 0;

              if (isInactiveToday) return null; // Simple filter for now

              return (
                <motion.div key={habit.id} layout className="widget-card p-3 flex items-center gap-3 relative overflow-hidden" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>

                  {isMultiFreq && !habit.completed && (
                    <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                  )}

                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    className="flex-shrink-0 relative"
                    onClick={() => handleToggle(habit)}
                  >
                    {habit.completed ? (
                      <CheckCircle2 className="w-7 h-7 text-primary fill-primary/10" />
                    ) : (
                      isMultiFreq ? (
                        <div className="w-7 h-7 rounded-full border-2 border-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                          {habit.currentProgress}/{target}
                        </div>
                      ) : (
                        <Circle className="w-7 h-7 text-muted-foreground" />
                      )
                    )}
                  </motion.button>

                  <div className="flex-1 min-w-0" onClick={() => handleToggle(habit)}>
                    <p className={`font-medium text-base ${habit.completed ? 'text-muted-foreground line-through decoration-primary/50' : ''}`}>
                      {habit.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {/* Category Badge */}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted flex items-center gap-1.5 w-fit">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                        {getCategoryName(habit.category)}
                      </span>

                      {/* Times Badge - Show today's times */}
                      {habit.todayTimes.length > 0 && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {habit.todayTimes.join(", ")}
                        </span>
                      )}

                      {/* Flex Schedule Badge */}
                      {habit.schedule.type === 'custom' && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 border border-muted px-1 rounded">
                          Flex
                        </span>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-muted rounded-full"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDelete(habit.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[auto] max-h-[90vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader className="mb-6"><SheetTitle>Novo Hábito</SheetTitle></SheetHeader>
          <HabitForm onSubmit={handleCreate} onCancel={() => setIsSheetOpen(false)} isLoading={createHabit.isPending} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Habits;
