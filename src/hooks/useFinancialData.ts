import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTransactions } from "./useTransactions";
import { useAccounts } from "./useAccounts";
import { useCreditCards } from "./useCreditCards"; // New Hook
import { calculateAccountBalance } from "@/core/finance/account-engine";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface FinanceSummary {
    spent_today: number;
    spent_month: number;
    spent_last_month: number;
    income_month: number;
    total_balance?: number; // Optional, depends on RPC
}

export function useFinancialData() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const {
        transactions,
        isLoading: isLoadingTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction
    } = useTransactions();

    const {
        accounts: rawAccounts,
        isLoading: isLoadingAccounts,
        createAccount,
        updateAccount,
        deleteAccount
    } = useAccounts();

    const {
        cards,
        isLoading: isLoadingCards,
        createCard,
        deleteCard
    } = useCreditCards();

    // RPC Call for Instant Performance
    const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
        queryKey: ['finance_summary', user?.id],
        queryFn: async (): Promise<FinanceSummary> => {
            if (!user) return { spent_today: 0, spent_month: 0, spent_last_month: 0, income_month: 0, total_balance: 0 };

            // @ts-ignore
            const { data, error } = await (supabase.rpc as any)('get_finance_summary', { p_user_id: user.id });

            if (error) {
                console.error("Error fetching finance summary RPC:", error);
                throw error;
            }

            // Ensure we pick the first item if it's an array
            const result = (data && Array.isArray(data) && data.length > 0) ? data[0] : null;
            return result || { spent_today: 0, spent_month: 0, spent_last_month: 0, income_month: 0, total_balance: 0 };
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    // Calculate Balances using the Engine (Keeping this for Charts/Details, but maybe not for KPI anymore)
    const accounts = useMemo(() => {
        return rawAccounts.map(account => {
            const currentBalance = calculateAccountBalance(account, transactions);
            return { ...account, current_balance: currentBalance };
        });
    }, [rawAccounts, transactions]);

    const totalBalance = accounts
        .filter(acc => acc.include_in_dashboard && !acc.is_archived)
        .reduce((acc, curr) => acc + Number(curr.current_balance), 0);

    const isLoading = isLoadingTransactions || isLoadingAccounts || isLoadingCards || isLoadingSummary;

    const refreshData = () => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
        queryClient.invalidateQueries({ queryKey: ['finance_summary'] }); // Refresh RPC too
    };

    return {
        // Data
        transactions,
        accounts,
        cards,
        totalBalance, // Legacy FE calc
        summaryData, // New RPC calc
        isLoading,

        // Actions
        createTransaction,
        updateTransaction,
        deleteTransaction,

        createAccount,
        updateAccount,
        deleteAccount,

        createCard,
        deleteCard,

        refreshData
    };
}
