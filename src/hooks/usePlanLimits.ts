import { useProfile } from "./useProfile";
import { useHabits } from "./useHabits";
import { useStreaks } from "./useStreaks";
import { getPlanConfig, PlanType } from "../config/plans";

export function usePlanLimits() {
    const { profile, isLoading: isProfileLoading } = useProfile();
    const { habits } = useHabits();
    const { streaks } = useStreaks();

    const currentPlanTier = (profile?.subscription_tier || 'free') as PlanType;
    const planConfig = getPlanConfig(currentPlanTier);
    const { features } = planConfig;

    const habitsCount = habits?.length || 0;
    const streaksCount = streaks?.length || 0;

    return {
        currentPlan: currentPlanTier,
        planLabel: planConfig.label,
        planPrice: planConfig.price,
        counts: {
            habits: habitsCount,
            streaks: streaksCount
        },
        limits: {
            maxHabits: features.maxHabits,
            maxStreaks: features.maxStreaks,
            aiDaily: features.aiMessagesPerDay
        },
        permissions: {
            canCreateHabit: habitsCount < features.maxHabits,
            canCreateStreak: streaksCount < features.maxStreaks,
            canViewFinancials: features.canViewFinancials,
            canUseAI: features.aiMessagesPerDay > 0,
        },
        isLoading: isProfileLoading
    };
}
