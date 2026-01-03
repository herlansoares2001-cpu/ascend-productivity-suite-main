import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import {
  getHabitMetadata,
  getAllHabitMetadata,
  saveHabitMetadata,
  getDailyProgress,
  incrementDailyProgress,
  resetDailyProgress,
  HabitMetadata,
  HabitSchedule
} from "@/storage/habit-storage";

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  completed?: boolean;

  category?: string;
  schedule: HabitSchedule;

  // Computed for Today
  todayFrequency: number;
  todayTimes: string[];
  currentProgress: number;
}

export function useHabits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split("T")[0];
  const todayDayOfWeek = todayDate.getDay(); // 0=Sun

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ["habits", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: habitsData, error: habitsError } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (habitsError) throw habitsError;

      const { data: completions, error: completionsError } = await supabase
        .from("habit_completions")
        .select("habit_id")
        .eq("user_id", user.id)
        .eq("completed_at", todayStr);

      if (completionsError) throw completionsError;

      const completedIds = new Set(completions?.map((c) => c.habit_id) || []);
      const allMeta = getAllHabitMetadata();

      return (habitsData || []).map((habit) => {
        // Resolve Metadata
        const meta = allMeta[habit.id];
        // Default schedule if missing (migration)
        const schedule: HabitSchedule = meta?.schedule || {
          type: 'simple',
          frequency: (meta as any)?.frequency || 1,
          times: (meta as any)?.time ? [(meta as any)?.time] : [],
          activeDays: [0, 1, 2, 3, 4, 5, 6],
          customDays: {}
        };

        // Calculate Today's Requirements
        let todayFrequency = 0;
        let todayTimes: string[] = [];

        if (schedule.type === 'simple') {
          if (schedule.activeDays.includes(todayDayOfWeek)) {
            todayFrequency = schedule.frequency;
            todayTimes = schedule.times || [];
          }
        } else {
          // Custom
          const dayTimes = schedule.customDays[todayDayOfWeek.toString()];
          if (dayTimes && dayTimes.length > 0) {
            todayFrequency = dayTimes.length;
            todayTimes = dayTimes;
          }
        }

        const localProgress = getDailyProgress(habit.id, todayStr);
        const isSupabaseComplete = completedIds.has(habit.id);

        // If Supabase says complete, trust it (max progress), else local
        const currentProgress = isSupabaseComplete ? (todayFrequency || 1) : localProgress;

        return {
          ...habit,
          completed: isSupabaseComplete,
          category: meta?.category || 'other',
          schedule,
          todayFrequency,
          todayTimes,
          currentProgress
        };
      });
    },
    enabled: !!user,
  });

  const { data: streak = 0 } = useQuery({
    queryKey: ["habit-streak", user?.id],
    queryFn: async () => {
      if (!user || habits.length === 0) return 0;

      let currentStreak = 0;
      const checkDate = new Date();

      for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split("T")[0];

        const { data: completions } = await supabase
          .from("habit_completions")
          .select("habit_id")
          .eq("user_id", user.id)
          .eq("completed_at", dateStr);

        const completedCount = completions?.length || 0;
        if (completedCount > 0) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (i > 0) {
          break;
        } else {
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }
      return currentStreak;
    },
    enabled: !!user && habits.length > 0,
  });

  const createHabit = useMutation({
    mutationFn: async (data: { name: string; category: string; schedule: HabitSchedule }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: newHabit, error } = await supabase
        .from("habits")
        .insert({ user_id: user.id, name: data.name })
        .select()
        .single();

      if (error) {
        console.error("Error creating habit (DB):", error);
        throw error;
      }
      if (!newHabit) throw new Error("No data returned");

      saveHabitMetadata(newHabit.id, {
        category: data.category,
        schedule: data.schedule
      });

      return newHabit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Hábito criado!");
    },
    onError: (e: any) => {
      console.error("Error creating habit:", e);
      toast.error(`Erro ao criar hábito: ${e.message || "Erro desconhecido"}`);
    },
  });

  const toggleHabit = useMutation({
    mutationFn: async (habit: Habit) => {
      if (!user) throw new Error("Not authenticated");

      if (habit.completed) {
        const { error } = await supabase
          .from("habit_completions")
          .delete()
          .eq("habit_id", habit.id)
          .eq("completed_at", todayStr);
        if (error) throw error;

        resetDailyProgress(habit.id, todayStr);
      } else {
        const newProgress = incrementDailyProgress(habit.id, todayStr);

        const target = habit.todayFrequency || 1;

        if (newProgress >= target) {
          const { error } = await supabase
            .from("habit_completions")
            .insert({ habit_id: habit.id, user_id: user.id, completed_at: todayStr });
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["habit-streak"] });
    },
    onError: () => {
      toast.error("Erro ao atualizar hábito");
    },
  });

  const deleteHabit = useMutation({
    mutationFn: async (habitId: string) => {
      const { error } = await supabase.from("habits").delete().eq("id", habitId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Hábito removido!");
    },
    onError: () => {
      toast.error("Erro ao remover hábito");
    },
  });

  return {
    habits,
    streak,
    isLoading,
    createHabit,
    toggleHabit,
    deleteHabit,
  };
}
