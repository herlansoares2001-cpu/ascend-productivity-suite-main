import { motion } from "framer-motion";
import { Target, ChevronRight } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  progress: number;
  deadline: string;
}

interface GoalsWidgetProps {
  goals: Goal[];
}

export function GoalsWidget({ goals }: GoalsWidgetProps) {
  const totalProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) 
    : 0;

  return (
    <motion.div 
      className="widget-card"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-secondary" />
          <span className="text-sm font-light text-muted-foreground">Metas 2026</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="4"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={175.93}
              initial={{ strokeDashoffset: 175.93 }}
              animate={{ strokeDashoffset: 175.93 - (175.93 * totalProgress) / 100 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-regular">{totalProgress}%</span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-2xl font-regular">{goals.length}</p>
          <p className="text-xs text-muted-foreground font-light">metas ativas</p>
        </div>
      </div>

      {goals.slice(0, 2).map((goal) => (
        <div key={goal.id} className="mb-2 last:mb-0">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-light truncate max-w-[60%]">{goal.title}</span>
            <span className="text-xs text-muted-foreground">{goal.progress}%</span>
          </div>
          <div className="progress-bar h-1.5">
            <motion.div 
              className="h-full rounded-full bg-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>
      ))}
    </motion.div>
  );
}
