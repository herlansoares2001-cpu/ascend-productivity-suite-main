import { useQueryClient } from "@tanstack/react-query";
import { useProfile } from "./useProfile";
import { useHabits } from "./useHabits";
import { useStreaks } from "./useStreaks";
import { getPlanLimits, PlanType } from "../config/plans";

export function usePlanLimits() {
    const { profile, isLoading: isProfileLoading } = useProfile();

    // We need to fetch counts.
    // Note: calling hooks here means this hook will subscribe to these data changes.
    // This is good for reactivity.
    const { habits } = useHabits();
    const { streaks } = useStreaks();

    const currentPlan = (profile?.subscription_tier || 'free') as PlanType;
    const limits = getPlanLimits(currentPlan);

    const habitsCount = habits?.length || 0;
    const streaksCount = streaks?.length || 0;

    const canCreateHabit = habitsCount < limits.maxHabits;
    const canCreateStreak = streaksCount < limits.maxStreaks;
    const canViewFinancials = limits.canViewFinancials;

    return {
        currentPlan,
        limits,
        counts: {
            habits: habitsCount,
            streaks: streaksCount
        },
        permissions: {
            canCreateHabit,
            canCreateStreak,
            canViewFinancials
        },
        isLoading: isProfileLoading
    };
}
