import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { CreditCard } from "@/types/finance";
import { toast } from "sonner";

export function useCreditCards() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: cards = [], isLoading } = useQuery({
        queryKey: ['credit_cards', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('credit_cards')
                .select('*')
                .eq('user_id', user.id)
                .order('name');

            if (error) {
                console.error("Error fetching (credit cards):", error);
                // Return empty if table doesn't exist yet (migration pending)
                return [];
            }
            return data as CreditCard[];
        },
        enabled: !!user
    });

    const createCard = useMutation({
        mutationFn: async (newCard: Omit<CreditCard, "id" | "user_id" | "created_at">) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const { data, error } = await supabase.from('credit_cards').insert({
                user_id: user.id,
                ...newCard
            }).select().single();

            if (error) {
                console.error("Error creating credit card:", error);
                throw error;
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
            toast.success("Cartão adicionado!");
        },
        onError: (e: any) => {
            console.error("Error creating card:", e);
            toast.error(`Erro ao adicionar cartão: ${e.message || "Erro desconhecido"}`);
        }
    });

    const deleteCard = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('credit_cards').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
            toast.success("Cartão removido!");
        }
    });

    return {
        cards,
        isLoading,
        createCard,
        deleteCard
    };
}
