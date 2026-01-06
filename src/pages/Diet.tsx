import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Apple,
  Plus,
  ChevronRight,
  Flame,
  Beef,
  Droplets,
  Cookie,
  Edit2,
  Trash2
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const DietPage = () => {
  const [meals, setMeals] = useState<Meal[]>(() => {
    const saved = localStorage.getItem('ascend_meals');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [time, setTime] = useState("");

  // Persist
  useEffect(() => {
    localStorage.setItem('ascend_meals', JSON.stringify(meals));
  }, [meals]);

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Handlers
  const handleOpenModal = (meal?: Meal) => {
    if (meal) {
      setEditingMeal(meal);
      setName(meal.name);
      setCalories(String(meal.calories));
      setProtein(String(meal.protein));
      setCarbs(String(meal.carbs));
      setFat(String(meal.fat));
      setTime(meal.time);
    } else {
      setEditingMeal(null);
      setName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return toast.error("Nome é obrigatório");

    const newMeal: Meal = {
      id: editingMeal ? editingMeal.id : crypto.randomUUID(),
      name,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      time
    };

    if (editingMeal) {
      setMeals(meals.map(m => m.id === editingMeal.id ? newMeal : m));
      toast.success("Refeição atualizada!");
    } else {
      setMeals([...meals, newMeal]);
      toast.success("Refeição adicionada!");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Excluir esta refeição?")) {
      setMeals(meals.filter(m => m.id !== id));
      toast.success("Refeição removida.");
      setIsModalOpen(false);
    }
  };

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
    <div className="page-container pb-24">
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
        className="widget-card widget-card-lime mb-6 dashed-border"
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
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
          whileTap={{ scale: 0.9 }}
          onClick={() => handleOpenModal()}
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
                onClick={() => handleOpenModal(meal)}
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
        </motion.div>
      )}

      {/* CREATE/EDIT DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-[#0a0a0a] border-white/10">
          <DialogHeader>
            <DialogTitle>{editingMeal ? 'Editar Refeição' : 'Nova Refeição'}</DialogTitle>
            <DialogDescription>Detalhes dos macros e calorias.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2">
                <Label>Nome do Prato/Refeição</Label>
                <Input placeholder="Ex: Almoço Saudável" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Calorias (kcal)</Label>
                <Input type="number" placeholder="0" value={calories} onChange={e => setCalories(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Proteína (g)</Label>
                <Input type="number" placeholder="0" value={protein} onChange={e => setProtein(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Carboidratos (g)</Label>
                <Input type="number" placeholder="0" value={carbs} onChange={e => setCarbs(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Gordura (g)</Label>
                <Input type="number" placeholder="0" value={fat} onChange={e => setFat(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {editingMeal && (
              <Button variant="destructive" onClick={() => handleDelete(editingMeal.id)} className="mr-auto">
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="bg-primary text-black hover:bg-primary/90">Salvar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DietPage;
