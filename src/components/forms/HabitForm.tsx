import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  addHabitCategory,
  getHabitCategories,
  HabitSchedule,
  HabitCategory
} from "@/lib/habit-storage";
import { Plus, X } from "lucide-react";
import { useCalendar } from "@/hooks/useCalendar";
import { toast } from "sonner";

interface HabitFormProps {
  onSubmit: (data: { name: string; category: string; schedule: HabitSchedule }) => void;
  onCancel: () => void;
  initialData?: any;
  isLoading?: boolean;
}

const WEEKDAYS = [
  { id: 1, label: "Seg" },
  { id: 2, label: "Ter" },
  { id: 3, label: "Qua" },
  { id: 4, label: "Qui" },
  { id: 5, label: "Sex" },
  { id: 6, label: "Sáb" },
  { id: 0, label: "Dom" },
];

export function HabitForm({ onSubmit, onCancel, initialData, isLoading }: HabitFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const { checkForConflicts } = useCalendar();

  // Category Logic
  const [categories, setCategories] = useState<HabitCategory[]>([]);
  const [category, setCategory] = useState(initialData?.category || "health");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Schedule Logic
  const [scheduleType, setScheduleType] = useState<"simple" | "custom">("simple");

  // Simple Mode State
  const [frequency, setFrequency] = useState(1);
  const [simpleTimes, setSimpleTimes] = useState<string[]>([""]);
  const [activeDays, setActiveDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  // Custom Mode State
  const [customDays, setCustomDays] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setCategories(getHabitCategories());
  }, []);

  useEffect(() => {
    setSimpleTimes(prev => {
      const newArr = [...prev];
      if (frequency > prev.length) {
        for (let i = prev.length; i < frequency; i++) newArr.push("");
      } else {
        newArr.splice(frequency);
      }
      return newArr;
    });
  }, [frequency]);

  const handleCategoryChange = (val: string) => {
    if (val === "create_new") {
      setIsNewCategory(true);
      setCategory("");
    } else {
      setIsNewCategory(false);
      setCategory(val);
    }
  };

  const toggleDay = (dayId: number) => {
    setActiveDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const handleCustomDayAdd = (dayId: number) => {
    setCustomDays(prev => ({
      ...prev,
      [dayId]: [...(prev[dayId] || []), ""]
    }));
  };

  const handleCustomDayTimeChange = (dayId: number, index: number, val: string) => {
    setCustomDays(prev => {
      const dayTimes = [...(prev[dayId] || [])];
      dayTimes[index] = val;
      return { ...prev, [dayId]: dayTimes };
    });
  };

  const handleCustomDayRemoveTime = (dayId: number, index: number) => {
    setCustomDays(prev => {
      const dayTimes = [...(prev[dayId] || [])];
      dayTimes.splice(index, 1);
      return { ...prev, [dayId]: dayTimes };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalCategory = category;
    if (isNewCategory && newCategoryName.trim()) {
      const newCat = addHabitCategory(newCategoryName.trim());
      finalCategory = newCat.id;
    }

    const schedule: HabitSchedule = {
      type: scheduleType,
      frequency,
      times: simpleTimes.filter(t => t),
      activeDays,
      customDays: {} // Filter empty
    };

    if (scheduleType === 'custom') {
      Object.entries(customDays).forEach(([day, times]) => {
        const validTimes = times.filter(t => t);
        if (validTimes.length > 0) {
          schedule.customDays[day] = validTimes;
        }
      });
    }

    // Check Conflicts
    const conflictMsg = checkForConflicts(name, schedule);
    if (conflictMsg) {
      toast.warning("Atenção: Conflito de Horário", {
        description: conflictMsg,
        action: {
          label: "Criar mesmo assim",
          onClick: () => onSubmit({
            name: name.trim(),
            category: finalCategory,
            schedule
          })
        },
        duration: 8000,
      });
      return;
    }

    onSubmit({
      name: name.trim(),
      category: finalCategory,
      schedule
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Hábito</Label>
        <Input
          id="name"
          placeholder="Ex: Treinar, Meditar..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Categoria</Label>
        {!isNewCategory ? (
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
              <SelectItem value="create_new" className="text-primary font-medium">
                + Criar nova tag
              </SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Nome da categoria"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              autoFocus
            />
            <Button type="button" variant="ghost" onClick={() => setIsNewCategory(false)}>
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-2 border-t">
        <div className="flex items-center justify-between">
          <Label className="text-base">Agendamento</Label>
          <div className="flex bg-muted rounded-lg p-1">
            <button
              type="button"
              className={`px-3 py-1 text-xs rounded-md transition-all ${scheduleType === 'simple' ? 'bg-background shadow' : ''}`}
              onClick={() => setScheduleType('simple')}
            >
              Simples
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs rounded-md transition-all ${scheduleType === 'custom' ? 'bg-background shadow' : ''}`}
              onClick={() => setScheduleType('custom')}
            >
              Flexível
            </button>
          </div>
        </div>

        {scheduleType === 'simple' ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
            <div className="space-y-2">
              <Label>Frequência (vezes ao dia)</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
              />
            </div>

            {frequency > 0 && (
              <div className="space-y-2">
                <Label>Horários</Label>
                <div className="grid grid-cols-3 gap-2">
                  {simpleTimes.map((time, idx) => (
                    <Input
                      key={idx}
                      type="time"
                      value={time}
                      onChange={e => {
                        const newArr = [...simpleTimes];
                        newArr[idx] = e.target.value;
                        setSimpleTimes(newArr);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Dias da Semana</Label>
              <div className="flex justify-between">
                {WEEKDAYS.map(day => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors ${activeDays.includes(day.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {day.label[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-1 max-h-[300px] overflow-y-auto pr-2">
            {WEEKDAYS.map(day => {
              const dayTimes = customDays[day.id] || [];
              const hasTimes = dayTimes.length > 0;

              return (
                <div key={day.id} className={`p-3 rounded-lg border ${hasTimes ? 'border-primary/20 bg-primary/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{day.label}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleCustomDayAdd(day.id)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {dayTimes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {dayTimes.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <Input
                            type="time"
                            className="h-8 w-24"
                            value={t}
                            onChange={e => handleCustomDayTimeChange(day.id, idx, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => handleCustomDayRemoveTime(day.id, idx)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Sem horários</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Criar Hábito"}
        </Button>
      </div>
    </form>
  );
}
