
export const PLAN_LIMITS = {
    free: {
        maxHabits: 3,
        maxStreaks: 1,
        canViewFinancials: false,
    },
    standard: {
        maxHabits: 9999,
        maxStreaks: 9999,
        canViewFinancials: true,
    },
    premium: {
        maxHabits: 9999,
        maxStreaks: 9999,
        canViewFinancials: true,
    },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export const getPlanLimits = (plan: string | null | undefined) => {
    const normalizedPlan = (plan?.toLowerCase() || 'free');
    // Safety check to ensure normalizedPlan is a valid key, otherwise default to free
    if (normalizedPlan in PLAN_LIMITS) {
        return PLAN_LIMITS[normalizedPlan as PlanType];
    }
    return PLAN_LIMITS.free;
};
