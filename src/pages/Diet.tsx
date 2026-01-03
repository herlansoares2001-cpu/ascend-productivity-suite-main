import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Apple, 
  Plus, 
  ChevronRight,
  Flame,
  Beef,
  Droplets,
  Cookie
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

const initialMeals: Meal[] = [
  { id: "1", name: "Café da manhã", calories: 450, protein: 25, carbs: 45, fat: 18, time: "07:30" },
  { id: "2", name: "Almoço", calories: 680, protein: 42, carbs: 65, fat: 22, time: "12:30" },
  { id: "3", name: "Lanche", calories: 220, protein: 12, carbs: 28, fat: 8, time: "16:00" },
];

const dailyGoals = {
  calories: 2200,
  protein: 150,
  carbs: 250,
  fat: 70,
};

const Diet = () => {
  const [meals] = useState<Meal[]>(initialMeals);

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const MacroProgress = ({ 
    label, 
    current, 
    goal, 
    icon: Icon, 
    color 
  }: { 
    label: string; 
    current: number; 
    goal: number; 
    icon: any; 
    color: string;
  }) => {
    const percentage = Math.min((current / goal) * 100, 100);
    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-xs text-muted-foreground font-light">{current}g</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div 
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <p className="text-xs text-muted-foreground font-light mt-1">{label}</p>
      </div>
    );
  };

  return (
    <div className="page-container">
      {/* Header */}
      <motion.header 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-regular mb-1">Dieta</h1>
        <p className="text-sm text-muted-foreground font-light">
          Registro de refeições e macros
        </p>
      </motion.header>

      {/* Calories Card */}
      <motion.div 
        className="widget-card widget-card-lime mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-light opacity-80">Calorias Hoje</p>
            <p className="text-4xl font-regular">{totals.calories}</p>
            <p className="text-sm font-light opacity-70">/ {dailyGoals.calories} kcal</p>
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
                  strokeDashoffset: 226.19 - (226.19 * Math.min(totals.calories / dailyGoals.calories, 1)) 
                }}
                transition={{ duration: 1 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-regular">
                {Math.round((totals.calories / dailyGoals.calories) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Macros */}
      <motion.div 
        className="widget-card mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-light text-muted-foreground mb-4">Macros do Dia</h3>
        <div className="flex gap-4">
          <MacroProgress 
            label="Proteína" 
            current={totals.protein} 
            goal={dailyGoals.protein} 
            icon={Beef}
            color="#EBFF57"
          />
          <MacroProgress 
            label="Carbos" 
            current={totals.carbs} 
            goal={dailyGoals.carbs} 
            icon={Cookie}
            color="#A2F7A1"
          />
          <MacroProgress 
            label="Gordura" 
            current={totals.fat} 
            goal={dailyGoals.fat} 
            icon={Droplets}
            color="#4ECDC4"
          />
        </div>
      </motion.div>

      {/* Meals List */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-regular">Refeições de Hoje</h2>
        <motion.button 
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </motion.button>
      </div>

      {meals.length === 0 ? (
        <EmptyState 
          icon={Apple}
          title="Nenhuma refeição"
          description="Registre suas refeições para acompanhar suas calorias e macros."
        />
      ) : (
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {meals.map((meal, index) => (
            <motion.div
              key={meal.id}
              className="widget-card flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center">
                <Apple className="w-6 h-6 text-secondary" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-regular">{meal.name}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-light">{meal.time}</span>
                  <span>•</span>
                  <span className="font-light">{meal.protein}g P</span>
                  <span className="font-light">{meal.carbs}g C</span>
                  <span className="font-light">{meal.fat}g G</span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-regular">{meal.calories}</p>
                <p className="text-xs text-muted-foreground font-light">kcal</p>
              </div>

              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Diet;
