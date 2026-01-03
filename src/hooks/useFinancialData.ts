import { useMemo } from "react";
import { useTransactions } from "./useTransactions";
import { useAccounts } from "./useAccounts";
import { useCreditCards } from "./useCreditCards"; // New Hook
import { calculateAccountBalance } from "@/core/finance/account-engine";
import { useQueryClient } from "@tanstack/react-query";

export function useFinancialData() {
    const queryClient = useQueryClient();

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

    // Calculate Balances using the Engine (now properly fed with DB data)
    const accounts = useMemo(() => {
        return rawAccounts.map(account => {
            const currentBalance = calculateAccountBalance(account, transactions);
            return { ...account, current_balance: currentBalance };
        });
    }, [rawAccounts, transactions]);

    const totalBalance = accounts
        .filter(acc => acc.include_in_dashboard && !acc.is_archived)
        .reduce((acc, curr) => acc + Number(curr.current_balance), 0);

    const isLoading = isLoadingTransactions || isLoadingAccounts || isLoadingCards;

    const refreshData = () => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
    };

    return {
        // Data
        transactions,
        accounts,
        cards,
        totalBalance,
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
