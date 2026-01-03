import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export function useTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const createTask = useMutation({
    mutationFn: async (title: string) => {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("tasks")
        .insert({ user_id: user.id, title });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa criada!");
    },
    onError: () => {
      toast.error("Erro ao criar tarefa");
    },
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !completed })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Erro ao atualizar tarefa");
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa removida!");
    },
    onError: () => {
      toast.error("Erro ao remover tarefa");
    },
  });

  return {
    tasks,
    isLoading,
    createTask,
    toggleTask,
    deleteTask,
  };
}
