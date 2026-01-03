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

      // Limpeza rigorosa do payload
      const payload: any = {
        description: data.description,
        amount: Number(data.amount), // Garantir número
        type: data.type,
        category: data.category,
        transaction_date: data.transaction_date,
        user_id: user.id,
        is_paid: Boolean(data.is_paid), // Garantir booleano
        is_recurring: Boolean(data.is_recurring),
        status: data.status || (Boolean(data.is_paid) ? 'paid' : 'pending'),
      };

      // Adicionar campos opcionais APENAS se tiverem valor real (não-nulo, não-undefined e não-string vazia)
      if (data.account_id && data.account_id.trim() !== "") payload.account_id = data.account_id;
      if (data.card_id && data.card_id.trim() !== "") payload.card_id = data.card_id;

      // Parcelamento e outros campos numéricos
      if (typeof data.total_installments === 'number') payload.total_installments = data.total_installments;
      if (typeof data.installment_number === 'number') payload.installment_number = data.installment_number;
      if (data.installment_group_id) payload.installment_group_id = data.installment_group_id;

      // Log payload antes de enviar para debug fácil
      console.log("Supabase Insert Payload:", payload);

      const { data: createdData, error } = await supabase
        .from("transactions")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Supabase Error Full Object:", error);
        // Melhorar mensagem de erro baseada no código do Postgres
        let msg = error.message;
        if (error.code === '23503') {
          if (error.message.includes('account_id')) msg = "Erro: A conta selecionada não existe ou foi excluída.";
          else msg = "Erro de integridade: Conta ou Cartão não encontrado.";
        }
        if (error.code === '42501') msg = "Permissão negada (RLS). Tente fazer logout e login novamente.";
        throw new Error(msg);
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
