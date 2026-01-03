import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  Plus, 
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Calendar
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

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
  { 
    id: "3", 
    title: "Correr uma maratona", 
    description: "42km de superação",
    progress: 20, 
    deadline: "Jun 2026",
    color: "#4ECDC4",
    subtasks: [
      { id: "3a", title: "Exames médicos", completed: true },
      { id: "3b", title: "Contratar personal", completed: false },
      { id: "3c", title: "Completar 10km", completed: false },
      { id: "3d", title: "Completar 21km", completed: false },
      { id: "3e", title: "Inscrição na maratona", completed: false },
    ]
  },
];

const Goals = () => {
  const [goals] = useState<Goal[]>(initialGoals);
  const [expandedGoal, setExpandedGoal] = useState<string | null>("1");

  const averageProgress = Math.round(
    goals.reduce((acc, g) => acc + g.progress, 0) / goals.length
  );

  const toggleGoal = (id: string) => {
    setExpandedGoal(expandedGoal === id ? null : id);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <motion.header 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-regular mb-1">Metas 2026</h1>
        <p className="text-sm text-muted-foreground font-light">
          Seus grandes objetivos do ano
        </p>
      </motion.header>

      {/* Overview Card */}
      <motion.div 
        className="widget-card widget-card-lime mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-light opacity-80">Progresso Geral</p>
            <p className="text-4xl font-regular">{averageProgress}%</p>
            <p className="text-sm font-light opacity-70">{goals.length} metas ativas</p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="6"
              />
              <motion.circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="rgba(0,0,0,0.8)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={226.19}
                initial={{ strokeDashoffset: 226.19 }}
                animate={{ 
                  strokeDashoffset: 226.19 - (226.19 * averageProgress / 100) 
                }}
                transition={{ duration: 1 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Goals List */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-regular">Suas Metas</h2>
        <motion.button 
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </motion.button>
      </div>

      {goals.length === 0 ? (
        <EmptyState 
          icon={Target}
          title="Nenhuma meta"
          description="Defina seus grandes objetivos para 2026."
        />
      ) : (
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {goals.map((goal, index) => {
            const isExpanded = expandedGoal === goal.id;
            const completedSubtasks = goal.subtasks.filter(s => s.completed).length;

            return (
              <motion.div
                key={goal.id}
                className="widget-card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div 
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => toggleGoal(goal.id)}
                >
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${goal.color}20` }}
                  >
                    <Target className="w-6 h-6" style={{ color: goal.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-regular">{goal.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className="font-light">{goal.deadline}</span>
                      </div>
                      <span>•</span>
                      <span className="font-light">{goal.progress}%</span>
                    </div>
                  </div>

                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </div>

                {/* Progress Bar */}
                <div className="progress-bar h-1.5 mt-4">
                  <motion.div 
                    className="h-full rounded-full"
                    style={{ backgroundColor: goal.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>

                {/* Subtasks */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: isExpanded ? "auto" : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground font-light mb-3">
                      Sub-tarefas ({completedSubtasks}/{goal.subtasks.length})
                    </p>
                    <div className="space-y-2">
                      {goal.subtasks.map((subtask) => (
                        <div key={subtask.id} className="flex items-center gap-3">
                          {subtask.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className={`text-sm font-light ${
                            subtask.completed ? 'text-muted-foreground line-through' : ''
                          }`}>
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default Goals;
