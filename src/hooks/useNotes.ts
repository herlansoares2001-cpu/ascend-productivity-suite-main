import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useCallback, useRef } from "react";

export interface Note {
  id: string;
  user_id: string;
  content: string;
  is_quick_note: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user,
  });

  const quickNote = notes.find((n) => n.is_quick_note);

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase
        .from("notes")
        .update({ content })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const updateQuickNote = useCallback(
    (content: string) => {
      if (!quickNote) return;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        updateNoteMutation.mutate({ id: quickNote.id, content });
      }, 1000);
    },
    [quickNote, updateNoteMutation]
  );

  const createNote = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("notes")
        .insert({ user_id: user.id, content, is_quick_note: false });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return {
    notes,
    quickNote,
    isLoading,
    updateQuickNote,
    createNote,
    deleteNote,
  };
}
