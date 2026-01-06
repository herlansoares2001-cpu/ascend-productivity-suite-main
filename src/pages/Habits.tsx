import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  CheckCircle2,
  Circle,
  Flame,
  Plus,
  Clock,
  MoreVertical,
  Trash2,
  Calendar,
  Zap,
  Lock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HabitForm } from "@/components/forms/HabitForm";
import { useHabits, Habit } from "@/hooks/useHabits";
import { getHabitCategories } from "@/storage/habit-storage";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useGamification } from "@/hooks/useGamification";
import { usePlanLimits } from "@/hooks/usePlanLimits"; // Added hook
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStreaks } from "@/hooks/useStreaks";
import { StreakCounter } from "@/components/streaks/StreakCounter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { StreakType } from "@/types/streak";

const Habits = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);

  const { habits, streak, isLoading, createHabit, toggleHabit, deleteHabit } = useHabits();
  const { awardXP } = useGamification();
  const { permissions } = usePlanLimits(); // Get permissions
  const navigate = useNavigate();
  const categories = getHabitCategories();

  // --- STREAK COUNTER LOGIC ---
  const { streaks, createStreak, resetStreak, deleteStreak } = useStreaks();
  const [isStreakDialogOpen, setIsStreakDialogOpen] = useState(false);
  const [newStreakData, setNewStreakData] = useState<{ title: string, type: StreakType, start_date: Date }>({
    title: "",
    type: 'quit_bad_habit',
    start_date: new Date()
  });

  const handleCreateStreak = () => {
    if (!newStreakData.title) return;
    createStreak.mutate(newStreakData);
    setIsStreakDialogOpen(false);
    setNewStreakData({ title: "", type: "quit_bad_habit", start_date: new Date() });
  };

  const completedCount = habits.filter(h => h.completed).length;
  const completionRate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

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
    if (!permissions.canCreateHabit) {
      toast.error("Limite de hábitos atingido!", {
        description: "Faça upgrade para Premium para criar ilimitados.",
        action: {
          label: "Upgrade",
          onClick: () => navigate("/plans")
        }
      });
      return;
    }
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
        <h1 className="text-2xl font-regular mb-1">Hábitos & Controle</h1>
        <p className="text-sm text-muted-foreground font-light">Construa sua melhor versão.</p>
      </motion.header>

      <Tabs defaultValue="routine" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary/20 p-1 rounded-full mb-6">
          <TabsTrigger value="routine" className="rounded-full data-[state=active]:bg-[#D4F657] data-[state=active]:text-black">Rotina</TabsTrigger>
          <TabsTrigger value="vices" className="rounded-full data-[state=active]:bg-[#D4F657] data-[state=active]:text-black">Controle</TabsTrigger>
        </TabsList>

        {/* TAB: ROTINA */}
        <TabsContent value="routine">
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

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-regular">Sua Lista</h2>
            <motion.button
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-colors ${!permissions.canCreateHabit ? 'bg-muted cursor-not-allowed' : 'bg-primary shadow-primary/20'}`}
              whileTap={permissions.canCreateHabit ? { scale: 0.9 } : {}}
              onClick={openCreate}
            >
              {!permissions.canCreateHabit ? (
                <Lock className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Plus className="w-5 h-5 text-primary-foreground" />
              )}
            </motion.button>
          </div>

          {habits.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Nenhum hábito" description="Adicione hábitos para começar." action={
              <motion.button className="px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm" whileTap={{ scale: 0.95 }} onClick={openCreate}>
                Adicionar Hábito
              </motion.button>
            } />
          ) : (
            <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AnimatePresence>
                {habits.map((habit) => {
                  const catColor = getCategoryColor(habit.category);
                  const target = habit.todayFrequency || 1;
                  const progressPercent = Math.min((habit.currentProgress / target) * 100, 100);
                  const isMultiFreq = target > 1;
                  const isInactiveToday = target === 0;

                  if (isInactiveToday) return null;

                  return (
                    <motion.div key={habit.id} layout className="widget-card p-3 flex items-center gap-3 relative overflow-hidden" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                      {isMultiFreq && !habit.completed && (
                        <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                      )}
                      <motion.button whileTap={{ scale: 0.8 }} className="flex-shrink-0 relative" onClick={() => handleToggle(habit)}>
                        {habit.completed ? (
                          <CheckCircle2 className="w-7 h-7 text-primary fill-primary/10" />
                        ) : (
                          isMultiFreq ? (
                            <div className="w-7 h-7 rounded-full border-2 border-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">{habit.currentProgress}/{target}</div>
                          ) : (
                            <Circle className="w-7 h-7 text-muted-foreground" />
                          )
                        )}
                      </motion.button>
                      <div className="flex-1 min-w-0" onClick={() => handleToggle(habit)}>
                        <p className={`font-medium text-base ${habit.completed ? 'text-muted-foreground line-through decoration-primary/50' : ''}`}>{habit.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted flex items-center gap-1.5 w-fit">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                            {getCategoryName(habit.category)}
                          </span>
                          {habit.todayTimes.length > 0 && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {habit.todayTimes.join(", ")}
                            </span>
                          )}
                          {habit.schedule.type === 'custom' && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 border border-muted px-1 rounded">Flex</span>
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
        </TabsContent>

        {/* TAB: VÍCIOS */}
        <TabsContent value="vices" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-regular">Meus Contadores</h2>
            <Button
              onClick={() => {
                if (!permissions.canCreateStreak) {
                  toast.error("Limite de contadores atingido!", {
                    description: "Faça upgrade para Premium.",
                    action: { label: "Ver Planos", onClick: () => navigate("/plans") }
                  });
                  return;
                }
                setIsStreakDialogOpen(true);
              }}
              size="sm"
              className={`${!permissions.canCreateStreak ? 'bg-muted text-muted-foreground hover:bg-muted' : 'bg-[#D4F657] text-black hover:bg-[#D4F657]/80'}`}
            >
              {!permissions.canCreateStreak ? <Lock className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {!permissions.canCreateStreak ? 'Limite Free' : 'Novo Contador'}
            </Button>
          </div>

          {streaks.length === 0 ? (
            <EmptyState icon={Zap} title="Nenhum contador" description="Monitore abstinência ou sequências importantes." action={
              <Button onClick={() => setIsStreakDialogOpen(true)} size="sm" variant="outline">Criar Primeiro</Button>
            } />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {streaks.map(streak => (
                <StreakCounter
                  key={streak.id}
                  streak={streak}
                  onReset={(id, reason) => resetStreak.mutate({ id, reason })}
                  onDelete={(id) => deleteStreak.mutate(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Habit Create Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[auto] max-h-[90vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader className="mb-6"><SheetTitle>Novo Hábito</SheetTitle></SheetHeader>
          <HabitForm onSubmit={handleCreate} onCancel={() => setIsSheetOpen(false)} isLoading={createHabit.isPending} />
        </SheetContent>
      </Sheet>

      {/* Streak Create Dialog */}
      <Dialog open={isStreakDialogOpen} onOpenChange={setIsStreakDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Contador de Sequência</DialogTitle>
            <DialogDescription>O que você quer monitorar?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Ex: Sem Refrigerante, Ler Livro..."
                value={newStreakData.title}
                onChange={(e) => setNewStreakData({ ...newStreakData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={newStreakData.type}
                onValueChange={(v) => setNewStreakData({ ...newStreakData, type: v as StreakType })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quit_bad_habit">Superar Desafio (Contador Abstinência)</SelectItem>
                  <SelectItem value="maintain_good_habit">Manter Hábito (Streak Positivo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data de Início (Retroativo)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newStreakData.start_date && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newStreakData.start_date ? format(newStreakData.start_date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={newStreakData.start_date}
                    onSelect={(d) => d && setNewStreakData({ ...newStreakData, start_date: d })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStreakDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateStreak} className="bg-[#D4F657] text-black">Criar Contador</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Habits;
