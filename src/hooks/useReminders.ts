import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type Priority = "low" | "medium" | "high";

export interface Reminder {
  id: string;
  user_id: string;
  text: string;
  priority: Priority;
  created_at: string;
}

export function useReminders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["reminders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Reminder[];
    },
    enabled: !!user,
  });

  const createReminder = useMutation({
    mutationFn: async ({ text, priority }: { text: string; priority: Priority }) => {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("reminders")
        .insert({ user_id: user.id, text, priority });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Lembrete adicionado!");
    },
    onError: () => {
      toast.error("Erro ao adicionar lembrete");
    },
  });

  const deleteReminder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reminders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Lembrete removido!");
    },
    onError: () => {
      toast.error("Erro ao remover lembrete");
    },
  });

  return {
    reminders,
    isLoading,
    createReminder,
    deleteReminder,
  };
}
