import { motion } from "framer-motion";
import { CheckCircle2, Circle, Flame } from "lucide-react";

interface HabitWidgetProps {
  habits: { id: string; name: string; completed: boolean }[];
  streak: number;
}

export function HabitWidget({ habits, streak }: HabitWidgetProps) {
  const completedCount = habits.filter(h => h.completed).length;
  const progress = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

  return (
    <motion.div 
      className="widget-card"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-light text-muted-foreground">Hábitos de Hoje</h3>
        <div className="streak-badge">
          <Flame className="w-3 h-3" />
          <span>{streak} dias</span>
        </div>
      </div>

      <div className="flex items-end justify-between mb-4">
        <div>
          <span className="text-4xl font-regular">{completedCount}</span>
          <span className="text-lg text-muted-foreground font-light">/{habits.length}</span>
        </div>
        <span className="text-sm text-muted-foreground font-light">
          {Math.round(progress)}% completo
        </span>
      </div>

      <div className="progress-bar">
        <motion.div 
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="mt-4 space-y-2">
        {habits.slice(0, 3).map((habit) => (
          <div key={habit.id} className="flex items-center gap-3">
            {habit.completed ? (
              <CheckCircle2 className="w-4 h-4 text-primary" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground" />
            )}
            <span className={`text-sm font-light ${habit.completed ? 'text-muted-foreground line-through' : ''}`}>
              {habit.name}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
