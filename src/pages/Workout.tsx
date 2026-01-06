import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Plus,
  ChevronRight,
  Flame,
  Timer,
  TrendingUp,
  Edit2,
  Trash2
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Workout {
  id: string;
  name: string;
  duration: number;
  calories: number;
  date: string;
  exercises: number;
}

const WorkoutPage = () => {
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const saved = localStorage.getItem('ascend_workouts');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [exercises, setExercises] = useState("");

  // Persist
  useEffect(() => {
    localStorage.setItem('ascend_workouts', JSON.stringify(workouts));
  }, [workouts]);

  // Stats
  const totalWorkouts = workouts.length;
  const totalCalories = workouts.reduce((acc, w) => acc + w.calories, 0);
  const totalMinutes = workouts.reduce((acc, w) => acc + w.duration, 0);

  // Handlers
  const handleOpenModal = (workout?: Workout) => {
    if (workout) {
      setEditingWorkout(workout);
      setName(workout.name);
      setDuration(String(workout.duration));
      setCalories(String(workout.calories));
      setExercises(String(workout.exercises));
    } else {
      setEditingWorkout(null);
      setName("");
      setDuration("");
      setCalories("");
      setExercises("");
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return toast.error("Nome é obrigatório");

    const newWorkout: Workout = {
      id: editingWorkout ? editingWorkout.id : crypto.randomUUID(),
      name,
      duration: Number(duration) || 0,
      calories: Number(calories) || 0,
      exercises: Number(exercises) || 0,
      date: editingWorkout ? editingWorkout.date : "Hoje" // Simple date handling for now
    };

    if (editingWorkout) {
      setWorkouts(workouts.map(w => w.id === editingWorkout.id ? newWorkout : w));
      toast.success("Treino atualizado!");
    } else {
      setWorkouts([newWorkout, ...workouts]);
      toast.success("Treino criado!");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Excluir este treino?")) {
      setWorkouts(workouts.filter(w => w.id !== id));
      toast.success("Treino removido.");
      setIsModalOpen(false); // Close if open
    }
  };

  return (
    <div className="page-container pb-24">
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
          <Timer className="w-5 h-5 text-secondary mx-auto mb-2" />
          <p className="text-2xl font-regular">{totalMinutes}</p>
          <p className="text-xs text-muted-foreground font-light">Minutos</p>
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
            const completed = workouts.length > index; // Dummy logic for visual
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
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
          whileTap={{ scale: 0.9 }}
          onClick={() => handleOpenModal()}
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
                onClick={() => handleOpenModal(workout)}
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

                <div className="text-right flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* CREATE/EDIT DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-[#0a0a0a] border-white/10">
          <DialogHeader>
            <DialogTitle>{editingWorkout ? 'Editar Treino' : 'Novo Treino'}</DialogTitle>
            <DialogDescription>Detalhes da sua sessão de exercícios.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Treino</Label>
              <Input placeholder="Ex: Musculação Peito" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duração (min)</Label>
                <Input type="number" placeholder="45" value={duration} onChange={e => setDuration(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Calorias (kcal)</Label>
                <Input type="number" placeholder="300" value={calories} onChange={e => setCalories(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Qtd. Exercícios</Label>
              <Input type="number" placeholder="6" value={exercises} onChange={e => setExercises(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {editingWorkout && (
              <Button variant="destructive" onClick={() => handleDelete(editingWorkout.id)} className="mr-auto">
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

export default WorkoutPage;
