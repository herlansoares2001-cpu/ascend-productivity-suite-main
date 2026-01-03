import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { Transaction } from "@/types/finance";

export function useTransactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  // Calculate Simple Dashboard Stats (Optional, might be moved to dashboard-engine)
  const balance = transactions.reduce((acc, t) => {
    return t.type === "income" ? acc + Number(t.amount) : acc - Number(t.amount);
  }, 0);

  const todaySpent = transactions
    .filter((t) => t.type === "expense" && t.transaction_date === new Date().toISOString().split("T")[0])
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const monthlySpent = transactions
    .filter((t) => {
      const txDate = new Date(t.transaction_date);
      const now = new Date();
      return t.type === "expense" && txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    })
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const createTransaction = useMutation({
    mutationFn: async (data: Omit<Transaction, "id" | "user_id" | "created_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: createdData, error } = await supabase
        .from("transactions")
        .insert({
          ...data,
          user_id: user.id,
          // Ensure booleans have defaults if undefined
          is_paid: data.is_paid ?? false,
          is_recurring: data.is_recurring ?? false
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating transaction:", error);
        throw error;
      }
      return createdData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transação adicionada!");
    },
    onError: (e: any) => {
      console.error("Error creating transaction (mutation):", e);
      toast.error(`Erro ao adicionar transação: ${e.message || "Erro desconhecido"}`);
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Transaction> & { id: string }) => {
      const { error } = await supabase
        .from("transactions")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transação atualizada!");
    },
    onError: () => {
      toast.error("Erro ao atualizar transação");
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transação removida!");
    },
    onError: () => {
      toast.error("Erro ao remover transação");
    },
  });

  return {
    transactions,
    balance,
    todaySpent,
    monthlySpent,
    isLoading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
