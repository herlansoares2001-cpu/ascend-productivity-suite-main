
export const PLAN_LIMITS = {
    free: {
        label: "Gratuito",
        price: 0,
        features: {
            maxHabits: 3,
            maxStreaks: 1,
            maxIntegrations: 0,
            aiMessagesPerDay: 5, // Apenas degustação
            canViewFinancials: false,
            prioritySupport: false,
        },
        description: "Para quem está começando a se organizar."
    },
    standard: {
        label: "Standard",
        price: 19.90,
        features: {
            maxHabits: 20, // Aumento significativo
            maxStreaks: 5,
            maxIntegrations: 1, // Ex: Apenas Google Calendar
            aiMessagesPerDay: 20, // Uso moderado
            canViewFinancials: true, // Libera o financeiro (Grande diferencial)
            prioritySupport: false,
        },
        description: "Para quem busca produtividade séria e controle financeiro."
    },
    premium: {
        label: "Premium",
        price: 29.90,
        features: {
            maxHabits: 9999, // Ilimitado
            maxStreaks: 9999,
            maxIntegrations: 9999,
            aiMessagesPerDay: 9999, // IA Ilimitada (Grande diferencial)
            canViewFinancials: true,
            prioritySupport: true,
        },
        description: "O Segundo Cérebro completo sem limites."
    },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export const getPlanConfig = (plan: string | null | undefined) => {
    const normalizedPlan = (plan?.toLowerCase() || 'free');
    if (normalizedPlan in PLAN_LIMITS) {
        return PLAN_LIMITS[normalizedPlan as PlanType];
    }
    return PLAN_LIMITS.free;
};
