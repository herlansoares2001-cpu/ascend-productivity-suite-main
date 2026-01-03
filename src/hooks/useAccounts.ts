import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Account } from "@/types/finance";
import { toast } from "sonner";

export function useAccounts() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: accounts = [], isLoading } = useQuery({
        queryKey: ['accounts', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', user.id)
                .order('name');

            if (error) {
                console.error("Error fetching accounts:", error);
                return [];
            }
            return data.map((acc: any) => ({
                ...acc,
                current_balance: Number(acc.initial_balance) // Initial mapping, will be calculated later
            })) as Account[];
        },
        enabled: !!user
    });

    const createAccount = useMutation({
        mutationFn: async (newAccount: Omit<Account, "id" | "user_id" | "current_balance" | "created_at" | "updated_at">) => {
            if (!user) throw new Error("User not found");
            const { data, error } = await supabase.from('accounts').insert({
                user_id: user.id,
                ...newAccount
            }).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success("Conta criada!");
        },
        onError: (e) => toast.error("Erro ao criar conta: " + e.message)
    });

    const updateAccount = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Account> & { id: string }) => {
            const { error } = await supabase.from('accounts').update(updates).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success("Conta atualizada!");
        }
    });

    const deleteAccount = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('accounts').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success("Conta removida!");
        }
    });

    return {
        accounts,
        isLoading,
        createAccount,
        updateAccount,
        deleteAccount
    };
}
