import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  pomodoro_duration: number;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil atualizado!");
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil");
    },
  });

  const updatePomodoroDuration = useMutation({
    mutationFn: async (duration: number) => {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("profiles")
        .update({ pomodoro_duration: duration })
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return {
    profile,
    isLoading,
    updateProfile,
    updatePomodoroDuration,
  };
}
