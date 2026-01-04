import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  ChevronDown,
  CheckCircle2,
  Circle,
  Calendar,
} from "lucide-react";

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
  // Goals State (Mock)
  const [goals] = useState<Goal[]>(initialGoals);
  const [expandedGoal, setExpandedGoal] = useState<string | null>("1");
  const averageGoalProgress = Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length);

  return (
    <div className="space-y-6 pb-24">
      <motion.header
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-regular mb-1">Metas & Estratégia</h1>
        <p className="text-sm text-muted-foreground font-light">
          Planejamento de longo prazo para 2026.
        </p>
      </motion.header>

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
          {/* Expandable Content */}
          <AnimatePresence>
            {expandedGoal === goal.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default Goals;
