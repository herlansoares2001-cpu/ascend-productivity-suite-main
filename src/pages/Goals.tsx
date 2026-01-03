import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Plus,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Calendar,
  Zap,
  Flame,
  Shield,
  Clock
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useStreaks } from "@/hooks/useStreaks";
import { StreakCounter } from "@/components/streaks/StreakCounter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StreakType } from "@/types/streak";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// --- Types (Goals Mocks) ---
interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  deadline: string;
  subtasks: SubTask[];
  color: string;
}

const initialGoals: Goal[] = [
  {
    id: "1",
    title: "Economizar R$50.000",
    description: "Meta de reserva de emergência",
    progress: 35,
    deadline: "Dez 2026",
    color: "#EBFF57",
    subtasks: [
      { id: "1a", title: "Abrir conta poupança", completed: true },
      { id: "1b", title: "Definir valor mensal", completed: true },
      { id: "1c", title: "Automatizar transferência", completed: false },
      { id: "1d", title: "Revisar gastos mensais", completed: false },
    ]
  },
  {
    id: "2",
    title: "Ler 24 livros",
    description: "2 livros por mês",
    progress: 50,
    deadline: "Dez 2026",
    color: "#A2F7A1",
    subtasks: [
      { id: "2a", title: "Criar lista de leitura", completed: true },
      { id: "2b", title: "Definir horário de leitura", completed: true },
      { id: "2c", title: "Participar de clube do livro", completed: false },
    ]
  },
];

const Goals = () => {
  const [activeTab, setActiveTab] = useState<"goals" | "streaks">("goals");

  // Goals State (Mock)
  const [goals] = useState<Goal[]>(initialGoals);
  const [expandedGoal, setExpandedGoal] = useState<string | null>("1");
  const averageGoalProgress = Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length);

  // Streaks State (Real)
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

  return (
    <div className="page-container pb-24">
      {/* Header */}
      <motion.header
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-regular mb-1">Metas & Compromissos</h1>
        <p className="text-sm text-muted-foreground font-light">
          Construa seu futuro e vença seus vícios.
        </p>
      </motion.header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("goals")}
          className={`chip ${activeTab === "goals" ? "active" : ""}`}
        >
          <Target className="w-4 h-4 mr-2" />
          Metas 2026
        </button>
        <button
          onClick={() => setActiveTab("streaks")}
          className={`chip ${activeTab === "streaks" ? "active" : ""}`}
        >
          <Zap className="w-4 h-4 mr-2" />
          Contadores (Streaks)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "goals" ? (
          <motion.div
            key="goals"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Overview Card */}
            <div className="widget-card widget-card-lime">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-light opacity-80">Progresso Geral</p>
                  <p className="text-4xl font-regular">{averageGoalProgress}%</p>
                  <p className="text-sm font-light opacity-70">{goals.length} metas ativas</p>
                </div>
                {/* SVG Chart Placeholder - kept simplified */}
                <div className="relative w-16 h-16 bg-black/5 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 opacity-50" />
                </div>
              </div>
            </div>

            {/* Goals List */}
            {goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                className="widget-card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${goal.color}20` }}
                  >
                    <Target className="w-6 h-6" style={{ color: goal.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-regular">{goal.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {goal.deadline}</span>
                      <span>•</span>
                      <span>{goal.progress}%</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${expandedGoal === goal.id ? 'rotate-180' : ''}`} />
                </div>
                {/* Expandable Content... (Simplified for brevity, same as before) */}
                {expandedGoal === goal.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="progress-bar h-1.5 mb-4">
                      <div className="h-full rounded-full" style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}></div>
                    </div>
                    <div className="space-y-2">
                      {goal.subtasks.map(s => (
                        <div key={s.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                          {s.completed ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4" />}
                          <span className={s.completed ? "line-through" : ""}>{s.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="streaks"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-regular">Meus Compromissos</h2>
              <Button onClick={() => setIsStreakDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> Novo</Button>
            </div>

            {streaks.length === 0 ? (
              <EmptyState icon={Clock} title="Nenhum contador" description="Adicione um contador para rastrear hábitos ou vícios." />
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Dialog */}
      <Dialog open={isStreakDialogOpen} onOpenChange={setIsStreakDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Compromisso</DialogTitle>
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
                  <SelectItem value="quit_bad_habit">Abandonar Vício (Verde)</SelectItem>
                  <SelectItem value="maintain_good_habit">Manter Hábito (Laranja)</SelectItem>
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
            <Button onClick={handleCreateStreak}>Criar Contador</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;
