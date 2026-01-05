import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  ChevronDown,
  CheckCircle2,
  Circle,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// --- Types ---
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
  color: string;
  subtasks: SubTask[];
}

const DEFAULT_GOALS: Goal[] = [
  {
    id: "1",
    title: "Economizar R$50.000",
    description: "Meta de reserva de emergência",
    progress: 35,
    deadline: "2026-12-31",
    color: "#EBFF57",
    subtasks: [
      { id: "1a", title: "Abrir conta poupança", completed: true },
      { id: "1b", title: "Definir valor mensal", completed: true },
      { id: "1c", title: "Automatizar transferência", completed: false },
    ]
  }
];

const Goals = () => {
  // State
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('ascend_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState("#EBFF57");
  const [tempSubtasks, setTempSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Stats
  const averageGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
    : 0;

  // Effects
  useEffect(() => {
    localStorage.setItem('ascend_goals', JSON.stringify(goals));
  }, [goals]);

  // Handlers
  const handleOpenModal = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setTitle(goal.title);
      setDescription(goal.description);
      setDeadline(goal.deadline);
      setColor(goal.color);
      setTempSubtasks(goal.subtasks);
    } else {
      setEditingGoal(null);
      setTitle("");
      setDescription("");
      setDeadline("");
      setColor("#EBFF57");
      setTempSubtasks([]);
    }
    setIsModalOpen(true);
  };

  const handleSaveGoal = () => {
    if (!title.trim()) return toast.error("Título é obrigatório");

    const newGoal: Goal = {
      id: editingGoal ? editingGoal.id : crypto.randomUUID(),
      title,
      description,
      deadline,
      color,
      subtasks: tempSubtasks,
      progress: calculateProgress(tempSubtasks)
    };

    if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal.id ? newGoal : g));
      toast.success("Meta atualizada!");
    } else {
      setGoals([...goals, newGoal]);
      toast.success("Nova meta criada!");
    }
    setIsModalOpen(false);
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta meta?")) {
      setGoals(goals.filter(g => g.id !== id));
      toast.success("Meta excluída.");
    }
  };

  const calculateProgress = (subtasks: SubTask[]) => {
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter(s => s.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  // Subtask Handlers inside Modal
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setTempSubtasks([...tempSubtasks, { id: crypto.randomUUID(), title: newSubtaskTitle, completed: false }]);
    setNewSubtaskTitle("");
  };

  const handleToggleSubtask = (goalId: string, subtaskId: string) => {
    // Only for main view interaction
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        const updatedSubtasks = g.subtasks.map(s =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        return { ...g, subtasks: updatedSubtasks, progress: calculateProgress(updatedSubtasks) };
      }
      return g;
    });
    setGoals(updatedGoals);
  };

  const handleRemoveSubtask = (id: string) => {
    setTempSubtasks(tempSubtasks.filter(s => s.id !== id));
  };


  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <motion.header
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-regular mb-1">Metas & Estratégia</h1>
          <p className="text-sm text-muted-foreground font-light">
            Planejamento de longo prazo.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary text-black hover:bg-primary/80">
          <Plus className="w-4 h-4 mr-2" /> Nova Meta
        </Button>
      </motion.header>

      {/* Overview Card */}
      <div className="widget-card widget-card-lime">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-light opacity-80">Progresso Geral</p>
            <p className="text-4xl font-regular">{averageGoalProgress}%</p>
            <p className="text-sm font-light opacity-70">{goals.length} metas ativas</p>
          </div>
          <div className="relative w-16 h-16 bg-black/5 rounded-full flex items-center justify-center">
            <Target className="w-6 h-6 opacity-50" />
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal, index) => (
          <motion.div
            key={goal.id}
            className="widget-card overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-4 cursor-pointer">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${goal.color}20` }}
                onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
              >
                <Target className="w-6 h-6" style={{ color: goal.color }} />
              </div>

              <div className="flex-1" onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}>
                <h3 className="font-regular">{goal.title}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {goal.deadline || 'Sem data'}</span>
                  <span>•</span>
                  <span>{goal.progress}%</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white" onClick={() => handleOpenModal(goal)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-500" onClick={() => handleDeleteGoal(goal.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform ${expandedGoal === goal.id ? 'rotate-180' : ''}`}
                  onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                />
              </div>
            </div>

            {/* Expandable Content */}
            <AnimatePresence>
              {expandedGoal === goal.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-sm text-zinc-400 mb-4">{goal.description}</p>

                    <div className="h-1.5 w-full bg-secondary/20 rounded-full mb-4 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}></div>
                    </div>

                    <div className="space-y-2">
                      {goal.subtasks.map(s => (
                        <div
                          key={s.id}
                          className="flex items-center gap-3 text-sm text-muted-foreground hover:bg-white/5 p-2 rounded-lg cursor-pointer transition-colors"
                          onClick={() => handleToggleSubtask(goal.id, s.id)}
                        >
                          {s.completed ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4" />}
                          <span className={s.completed ? "line-through opacity-50" : ""}>{s.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-[#0a0a0a] border-white/10">
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
            <DialogDescription>Defina sua meta e os passos para alcançá-la.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Economizar 10k" />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes da meta..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prazo</Label>
                <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-2 mt-1">
                  {['#EBFF57', '#A2F7A1', '#FF5757', '#5773FF'].map(c => (
                    <div
                      key={c}
                      className={`w-8 h-8 rounded-full cursor-pointer border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subtarefas (Etapas)</Label>
              <div className="flex gap-2">
                <Input
                  value={newSubtaskTitle}
                  onChange={e => setNewSubtaskTitle(e.target.value)}
                  placeholder="Adicionar etapa..."
                  onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                />
                <Button size="icon" variant="secondary" onClick={handleAddSubtask}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="max-h-[150px] overflow-y-auto space-y-1 mt-2">
                {tempSubtasks.map(s => (
                  <div key={s.id} className="flex justify-between items-center bg-white/5 p-2 rounded text-sm mb-1">
                    <span>{s.title}</span>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => handleRemoveSubtask(s.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveGoal} className="bg-primary text-black hover:bg-primary/90">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;
