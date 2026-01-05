import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Plus,
  ChevronRight,
  Flame,
  Timer,
  TrendingUp
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

interface Workout {
  id: string;
  name: string;
  duration: number;
  calories: number;
  date: string;
  exercises: number;
}

const initialWorkouts: Workout[] = [
  { id: "1", name: "Treino de Peito", duration: 45, calories: 320, date: "Hoje", exercises: 6 },
  { id: "2", name: "Cardio HIIT", duration: 30, calories: 280, date: "Ontem", exercises: 8 },
  { id: "3", name: "Treino de Pernas", duration: 50, calories: 380, date: "2 dias atrás", exercises: 7 },
];

const Workout = () => {
  const [workouts] = useState<Workout[]>(initialWorkouts);
  const [activeTab, setActiveTab] = useState<"workouts" | "stats">("workouts");

  const totalWorkouts = 156;
  const totalCalories = workouts.reduce((acc, w) => acc + w.calories, 0);
  const weekStreak = 5;

  return (
    <div className="page-container">
      {/* Header */}
      <motion.header
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-regular mb-1">Treino</h1>
        <p className="text-sm text-muted-foreground font-light">
          Log de exercícios diários
        </p>
      </motion.header>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="widget-card text-center py-4">
          <Dumbbell className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-regular">{totalWorkouts}</p>
          <p className="text-xs text-muted-foreground font-light">Treinos</p>
        </div>
        <div className="widget-card text-center py-4">
          <Flame className="w-5 h-5 text-secondary mx-auto mb-2" />
          <p className="text-2xl font-regular">{weekStreak}</p>
          <p className="text-xs text-muted-foreground font-light">Semana</p>
        </div>
        <div className="widget-card text-center py-4">
          <TrendingUp className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
          <p className="text-2xl font-regular">{totalCalories}</p>
          <p className="text-xs text-muted-foreground font-light">kcal</p>
        </div>
      </motion.div>

      {/* Week Progress */}
      <motion.div
        className="widget-card widget-card-green mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-light opacity-80 mb-3">Progresso da Semana</h3>
        <div className="flex justify-between gap-2">
          {["S", "T", "Q", "Q", "S", "S", "D"].map((day, index) => {
            const completed = index < 5;
            return (
              <div key={`${day}-${index}`} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completed ? "bg-primary-foreground/20" : "bg-primary-foreground/10"
                  }`}>
                  {completed && <Dumbbell className="w-4 h-4" />}
                </div>
                <span className="text-xs font-light">{day}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Workouts List */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-regular">Últimos Treinos</h2>
        <motion.button
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </motion.button>
      </div>

      {workouts.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Nenhum treino"
          description="Registre seus exercícios para acompanhar seu progresso."
        />
      ) : (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {workouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              className="widget-card flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-regular">{workout.name}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    <span className="font-light">{workout.duration}min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    <span className="font-light">{workout.calories}kcal</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-muted-foreground font-light">{workout.date}</p>
              </div>

              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Workout;
