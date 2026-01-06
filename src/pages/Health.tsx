import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Apple,
  Plus,
  ChevronRight,
  Flame,
  Timer,
  TrendingUp,
  Edit2,
  Trash2,
  List,
  Beef,
  Droplets,
  Cookie
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";

// --- TYPES ---
interface Workout {
  id: string;
  name: string;
  duration: number;
  calories: number;
  date: string;
  exercises: number;
}

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

const dailyGoals = {
  calories: 2200,
  protein: 150,
  carbs: 250,
  fat: 70,
};

const HealthPage = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "workouts";
  const [activeTab, setActiveTab] = useState(defaultTab); // 'workouts' | 'diet'

  // --- WORKOUT STATE ---
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const saved = localStorage.getItem('ascend_workouts');
    return saved ? JSON.parse(saved) : [];
  });

  // --- DIET STATE ---
  const [meals, setMeals] = useState<Meal[]>(() => {
    const saved = localStorage.getItem('ascend_meals');
    return saved ? JSON.parse(saved) : [];
  });

  // --- MODAL STATE ---
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isDietModalOpen, setIsDietModalOpen] = useState(false);

  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // --- WORKOUT FORM STATE ---
  const [wName, setWName] = useState("");
  const [wDuration, setWDuration] = useState("");
  const [wCalories, setWCalories] = useState("");
  const [wExercises, setWExercises] = useState("");

  // --- DIET FORM STATE ---
  const [dName, setDName] = useState("");
  const [dCalories, setDCalories] = useState("");
  const [dProtein, setDProtein] = useState("");
  const [dCarbs, setDCarbs] = useState("");
  const [dFat, setDFat] = useState("");
  const [dTime, setDTime] = useState("");

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('ascend_workouts', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem('ascend_meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    // Update tab if URL Param changes
    const tab = searchParams.get("tab");
    if (tab && (tab === 'workouts' || tab === 'diet')) {
      setActiveTab(tab);
    }
  }, [searchParams])

  // --- STATS WORKOUT ---
  const totalWorkouts = workouts.length;
  const wTotalCalories = workouts.reduce((acc, w) => acc + w.calories, 0);
  const totalMinutes = workouts.reduce((acc, w) => acc + w.duration, 0);

  // --- STATS DIET ---
  const dTotals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // --- WORKOUT HANDLERS ---
  const openWorkoutModal = (workout?: Workout) => {
    if (workout) {
      setEditingWorkout(workout);
      setWName(workout.name);
      setWDuration(String(workout.duration));
      setWCalories(String(workout.calories));
      setWExercises(String(workout.exercises));
    } else {
      setEditingWorkout(null);
      setWName("");
      setWDuration("");
      setWCalories("");
      setWExercises("");
    }
    setIsWorkoutModalOpen(true);
  };

  const saveWorkout = () => {
    if (!wName.trim()) return toast.error("Nome é obrigatório");

    const newWorkout: Workout = {
      id: editingWorkout ? editingWorkout.id : crypto.randomUUID(),
      name: wName,
      duration: Number(wDuration) || 0,
      calories: Number(wCalories) || 0,
      exercises: Number(wExercises) || 0,
      date: editingWorkout ? editingWorkout.date : "Hoje"
    };

    if (editingWorkout) {
      setWorkouts(workouts.map(w => w.id === editingWorkout.id ? newWorkout : w));
      toast.success("Treino atualizado!");
    } else {
      setWorkouts([newWorkout, ...workouts]);
      toast.success("Treino criado!");
    }
    setIsWorkoutModalOpen(false);
  };

  const deleteWorkout = (id: string) => {
    if (confirm("Excluir este treino?")) {
      setWorkouts(workouts.filter(w => w.id !== id));
      toast.success("Treino removido.");
      setIsWorkoutModalOpen(false);
    }
  };

  // --- DIET HANDLERS ---
  const openDietModal = (meal?: Meal) => {
    if (meal) {
      setEditingMeal(meal);
      setDName(meal.name);
      setDCalories(String(meal.calories));
      setDProtein(String(meal.protein));
      setDCarbs(String(meal.carbs));
      setDFat(String(meal.fat));
      setDTime(meal.time);
    } else {
      setEditingMeal(null);
      setDName("");
      setDCalories("");
      setDProtein("");
      setDCarbs("");
      setDFat("");
      setDTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    setIsDietModalOpen(true);
  };

  const saveDiet = () => {
    if (!dName.trim()) return toast.error("Nome é obrigatório");

    const newMeal: Meal = {
      id: editingMeal ? editingMeal.id : crypto.randomUUID(),
      name: dName,
      calories: Number(dCalories) || 0,
      protein: Number(dProtein) || 0,
      carbs: Number(dCarbs) || 0,
      fat: Number(dFat) || 0,
      time: dTime
    };

    if (editingMeal) {
      setMeals(meals.map(m => m.id === editingMeal.id ? newMeal : m));
      toast.success("Refeição atualizada!");
    } else {
      setMeals([...meals, newMeal]);
      toast.success("Refeição adicionada!");
    }
    setIsDietModalOpen(false);
  };

  const deleteDiet = (id: string) => {
    if (confirm("Excluir esta refeição?")) {
      setMeals(meals.filter(m => m.id !== id));
      toast.success("Refeição removida.");
      setIsDietModalOpen(false);
    }
  };

  // --- MACRO COMPONENT ---
  const MacroProgress = ({ label, current, goal, icon: Icon, color }: any) => {
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
            animate={{ width: `${percentage}% ` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <p className="text-xs text-muted-foreground font-light mt-1">{label}</p>
      </div>
    );
  };

  return (
    <div className="page-container pb-24">
      {/* Header */}
      <motion.header
        className="mb-6 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-regular mb-1">Saúde e Bem-estar</h1>
          <p className="text-sm text-muted-foreground font-light">
            Gerencie seus treinos e dieta em um só lugar.
          </p>
        </div>
      </motion.header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-zinc-900/50">
          <TabsTrigger value="workouts">Treinos</TabsTrigger>
          <TabsTrigger value="diet">Dieta</TabsTrigger>
        </TabsList>

        {/* --- WORKOUT CONTENT --- */}
        <TabsContent value="workouts" className="space-y-6 animate-in fade-in duration-300">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="widget-card text-center py-4">
              <Dumbbell className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-regular">{totalWorkouts}</p>
              <p className="text-xs text-muted-foreground font-light">Treinos</p>
            </div>
            <div className="widget-card text-center py-4">
              <Timer className="w-5 h-5 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-regular">{totalMinutes}</p>
              <p className="text-xs text-muted-foreground font-light">Minutos</p>
            </div>
            <div className="widget-card text-center py-4">
              <TrendingUp className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-regular">{wTotalCalories}</p>
              <p className="text-xs text-muted-foreground font-light">kcal</p>
            </div>
          </div>

          {/* List Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-regular">Meus Treinos</h2>
            <motion.button
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
              whileTap={{ scale: 0.9 }}
              onClick={() => openWorkoutModal()}
            >
              <Plus className="w-5 h-5 text-primary-foreground" />
            </motion.button>
          </div>

          {/* List */}
          {workouts.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="Nenhum treino"
              description="Registre seus exercícios aqui."
            />
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {workouts.map((workout, index) => (
                  <motion.div
                    key={workout.id}
                    layout
                    className="widget-card flex items-center gap-4 cursor-pointer hover:bg-white/5 active:scale-[0.99] transition-all group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openWorkoutModal(workout)}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-regular">{workout.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {workout.duration}min</span>
                        <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {workout.calories}kcal</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* --- DIET CONTENT --- */}
        <TabsContent value="diet" className="space-y-6 animate-in fade-in duration-300">
          {/* Stats */}
          <div className="widget-card widget-card-lime dashed-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-light opacity-80">Calorias Hoje</p>
                <p className="text-4xl font-regular">{dTotals.calories}</p>
                <p className="text-sm font-light opacity-70">/ {dailyGoals.calories} kcal</p>
              </div>
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="6" />
                  <motion.circle
                    cx="40" cy="40" r="36" fill="none" stroke="rgba(0,0,0,0.8)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={226.19}
                    initial={{ strokeDashoffset: 226.19 }}
                    animate={{ strokeDashoffset: 226.19 - (226.19 * Math.min(dTotals.calories / dailyGoals.calories, 1)) }}
                    transition={{ duration: 1 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-regular">{Math.round((dTotals.calories / dailyGoals.calories) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="widget-card">
            <div className="flex gap-4">
              <MacroProgress label="Proteína" current={dTotals.protein} goal={dailyGoals.protein} icon={Beef} color="#EBFF57" />
              <MacroProgress label="Carbos" current={dTotals.carbs} goal={dailyGoals.carbs} icon={Cookie} color="#A2F7A1" />
              <MacroProgress label="Gordura" current={dTotals.fat} goal={dailyGoals.fat} icon={Droplets} color="#4ECDC4" />
            </div>
          </div>

          {/* List Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-regular">Refeições de Hoje</h2>
            <motion.button
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
              whileTap={{ scale: 0.9 }}
              onClick={() => openDietModal()}
            >
              <Plus className="w-5 h-5 text-primary-foreground" />
            </motion.button>
          </div>

          {/* List */}
          {meals.length === 0 ? (
            <EmptyState
              icon={Apple}
              title="Nenhuma refeição"
              description="Registre seus alimentos aqui."
            />
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {meals.map((meal, index) => (
                  <motion.div
                    key={meal.id}
                    layout
                    className="widget-card flex items-center gap-4 cursor-pointer hover:bg-white/5 active:scale-[0.99] transition-all group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openDietModal(meal)}
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
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* --- DIALOGS --- */}

      {/* Workout Dialog */}
      <Dialog open={isWorkoutModalOpen} onOpenChange={setIsWorkoutModalOpen}>
        <DialogContent className="max-w-md bg-[#0a0a0a] border-white/10">
          <DialogHeader><DialogTitle>{editingWorkout ? 'Editar Treino' : 'Novo Treino'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Nome</Label><Input value={wName} onChange={e => setWName(e.target.value)} placeholder="Ex: Musculação" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Duração (min)</Label><Input type="number" value={wDuration} onChange={e => setWDuration(e.target.value)} /></div>
              <div className="space-y-2"><Label>Calorias (kcal)</Label><Input type="number" value={wCalories} onChange={e => setWCalories(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Exercícios</Label><Input type="number" value={wExercises} onChange={e => setWExercises(e.target.value)} /></div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {editingWorkout && <Button variant="destructive" onClick={() => deleteWorkout(editingWorkout.id)} className="mr-auto"><Trash2 className="w-4 h-4 mr-2" />Excluir</Button>}
            <div className="flex gap-2"><Button variant="outline" onClick={() => setIsWorkoutModalOpen(false)}>Cancelar</Button><Button onClick={saveWorkout} className="bg-primary text-black">Salvar</Button></div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diet Dialog */}
      <Dialog open={isDietModalOpen} onOpenChange={setIsDietModalOpen}>
        <DialogContent className="max-w-md bg-[#0a0a0a] border-white/10">
          <DialogHeader><DialogTitle>{editingMeal ? 'Editar Refeição' : 'Nova Refeição'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2"><Label>Nome</Label><Input value={dName} onChange={e => setDName(e.target.value)} placeholder="Ex: Almoço" /></div>
              <div className="space-y-2"><Label>Hora</Label><Input type="time" value={dTime} onChange={e => setDTime(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Calorias</Label><Input type="number" value={dCalories} onChange={e => setDCalories(e.target.value)} /></div>
              <div className="space-y-2"><Label>Proteína (g)</Label><Input type="number" value={dProtein} onChange={e => setDProtein(e.target.value)} /></div>
              <div className="space-y-2"><Label>Carboidratos (g)</Label><Input type="number" value={dCarbs} onChange={e => setDCarbs(e.target.value)} /></div>
              <div className="space-y-2"><Label>Gordura (g)</Label><Input type="number" value={dFat} onChange={e => setDFat(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {editingMeal && <Button variant="destructive" onClick={() => deleteDiet(editingMeal.id)} className="mr-auto"><Trash2 className="w-4 h-4 mr-2" />Excluir</Button>}
            <div className="flex gap-2"><Button variant="outline" onClick={() => setIsDietModalOpen(false)}>Cancelar</Button><Button onClick={saveDiet} className="bg-primary text-black">Salvar</Button></div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default HealthPage;
