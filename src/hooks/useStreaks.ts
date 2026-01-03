import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { Streak, StreakType, StreakHistory } from "@/types/streak";
import { differenceInSeconds } from "date-fns";
import { useGamification } from "./useGamification";

export function useStreaks() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { awardXP } = useGamification();

    // 1. Fetch Streaks
    const { data: streaks = [], isLoading } = useQuery({
        queryKey: ["streaks", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("habit_streaks")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Streak[];
        },
        enabled: !!user,
    });

    // 2. Create Streak
    const createStreak = useMutation({
        mutationFn: async (newStreak: { title: string; type: StreakType; start_date: Date }) => {
            if (!user) throw new Error("Usuário não autenticado");

            const { error } = await supabase.from("habit_streaks").insert({
                user_id: user.id,
                title: newStreak.title,
                type: newStreak.type,
                start_date: newStreak.start_date.toISOString(),
                last_relapse_date: newStreak.start_date.toISOString(), // Inicia igual ao start
                reset_history: []
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["streaks"] });
            toast.success("Novo compromisso criado!");
            awardXP(20, "Criou novo Streak");
        },
        onError: () => toast.error("Erro ao criar compromisso.")
    });

    // 3. Reset Streak (Relapse)
    const resetStreak = useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
            if (!user) return;

            // Buscar streak atual para calcular recorde
            const streak = streaks.find(s => s.id === id);
            if (!streak) throw new Error("Streak não encontrado");

            const now = new Date();
            const lastRelapse = new Date(streak.last_relapse_date);
            const currentDurationSeconds = differenceInSeconds(now, lastRelapse);

            // Calcula se bateu recorde
            const newLongest = Math.max(currentDurationSeconds, streak.longest_streak_seconds);

            // Atualiza histórico
            const newHistoryItem: StreakHistory = {
                date: now.toISOString(),
                reason: reason || "Reinício manual"
            };

            // Supabase JSONB append is tricky via simple update, best to fetch array and push (React Query cache helps here)
            // Mas vamos mandar o array novo concatenado
            const updatedHistory = [...(streak.reset_history || []), newHistoryItem];

            const { error } = await supabase.from("habit_streaks").update({
                last_relapse_date: now.toISOString(),
                longest_streak_seconds: newLongest,
                reset_history: updatedHistory as any // Cast para JSONB
            }).eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["streaks"] });
            toast.info("Contador reiniciado. Força na jornada!");
        },
        onError: () => toast.error("Erro ao reiniciar contador.")
    });

    // 4. Delete Streak
    const deleteStreak = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("habit_streaks").delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["streaks"] });
            toast.success("Compromisso removido.");
        }
    });

    return {
        streaks,
        isLoading,
        createStreak,
        resetStreak,
        deleteStreak
    };
}
