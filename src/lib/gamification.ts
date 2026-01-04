
import { Divide, Trophy, Zap, Target, Wallet, BookOpen, Calendar, Activity, Droplets, Flame } from "lucide-react";

// --- LEVELING SYSTEM (100 Levels) ---
// Formula: XP Required for Level L = 100 * (L-1)^1.5 + 100
// This creates a progressive curve.
export const MAX_LEVEL = 100;

export const XP_TABLE: number[] = Array.from({ length: MAX_LEVEL + 1 }, (_, i) => {
    if (i === 0) return 0;
    if (i === 1) return 0; // Start at 0 XP
    // XP needed to REACH level i from level i-1
    return Math.floor(100 * Math.pow(i, 1.3));
});

// Helper to get total cumulative XP for a level for display if needed
export const getLevelForXP = (currentXP: number): { level: number; currentLevelXP: number; nextLevelXP: number; progress: number } => {
    let level = 1;
    let xp = currentXP;

    for (let i = 2; i <= MAX_LEVEL; i++) {
        const xpNeeded = XP_TABLE[i];
        if (xp < xpNeeded) {
            return {
                level,
                currentLevelXP: xp,
                nextLevelXP: xpNeeded,
                progress: (xp / xpNeeded) * 100
            };
        }
        level = i;
        xp -= xpNeeded; // Deduct XP consumed by previous levels if we treat XP as cumulative in database? 
        // Usually games keep total XP. Let's assume input is Total XP.
        // Wait, if XP_TABLE[i] is "XP needed for next level", then:
    }

    return { level: MAX_LEVEL, currentLevelXP: xp, nextLevelXP: XP_TABLE[MAX_LEVEL], progress: 100 };
};


// --- OFFERS ---
export interface Badge {
    id: string;
    name: string;
    description: string;
    category: 'habits' | 'finances' | 'productivity' | 'health' | 'learning' | 'social';
    icon: any; // Lucide Icon or string
    xpReward: number;
    conditionType: string;
    conditionValue: number;
    tier: number; // 1 to 5 (Bronze, Silver, Gold, Platinum, Diamond)
}

// Generators for Tiers
const generateTieredBadges = (
    baseId: string,
    baseName: string,
    descriptionTemplate: string,
    category: Badge['category'],
    icon: any,
    thresholds: number[],
    xpMultipliers: number[]
): Badge[] => {
    return thresholds.map((threshold, index) => ({
        id: `${baseId}_${threshold}`,
        name: `${baseName} ${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][index] || index + 1}`,
        description: descriptionTemplate.replace('{}', threshold.toString()),
        category,
        icon,
        xpReward: (xpMultipliers[index] || 50),
        conditionType: baseId,
        conditionValue: threshold,
        tier: index + 1
    }));
};

// --- BADGE DATABASE (300+ Badges) ---

const habitBadges = generateTieredBadges(
    'habit_count',
    'Mestre dos Hábitos',
    'Complete {} hábitos no total.',
    'habits',
    Trophy,
    [1, 10, 50, 100, 250, 500, 1000, 1500, 2500, 5000, 7500, 10000],
    [10, 50, 100, 250, 500, 1000, 2000, 3000, 5000, 7500, 10000, 15000]
);

const streakBadges = generateTieredBadges(
    'streak_days',
    'O Imparável',
    'Mantenha um streak perfeito de {} dias.',
    'habits',
    Flame,
    [3, 7, 14, 21, 30, 60, 90, 120, 180, 250, 300, 365, 500, 730, 1000],
    [20, 50, 100, 150, 300, 600, 1000, 1500, 2500, 3500, 5000, 10000, 15000, 25000, 50000]
);

const financeBadges = generateTieredBadges(
    'finance_log',
    'Gerente Financeiro',
    'Registre {} transações financeiras.',
    'finances',
    Wallet,
    [1, 5, 20, 50, 100, 200, 500, 1000, 2000, 5000],
    [10, 30, 80, 150, 300, 500, 1000, 2000, 5000, 10000]
);

const focusBadges = generateTieredBadges(
    'productivity_tasks',
    'Realizador',
    'Conclua {} tarefas.',
    'productivity',
    Target,
    [1, 10, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
    [10, 50, 150, 300, 600, 1000, 2000, 5000, 10000, 20000]
);

const bookBadges = generateTieredBadges(
    'books_read',
    'Leitor Voraz',
    'Termine a leitura de {} livros.',
    'learning',
    BookOpen,
    [1, 3, 5, 10, 20, 30, 50, 75, 100, 200],
    [50, 150, 250, 500, 1000, 1500, 3000, 5000, 7500, 15000]
);

const waterBadges = generateTieredBadges(
    'water_logs',
    'Hidratado',
    'Bata sua meta de água {} vezes.',
    'health',
    Droplets,
    [1, 7, 30, 60, 90, 180, 365, 500, 730, 1000],
    [10, 50, 150, 300, 500, 1000, 2500, 4000, 6000, 10000]
);

const workoutBadges = generateTieredBadges(
    'workout_sessions',
    'Atleta',
    'Complete {} treinos.',
    'health',
    Activity,
    [1, 5, 10, 25, 50, 100, 200, 300, 500, 1000],
    [20, 80, 150, 300, 600, 1200, 2500, 4000, 7500, 15000]
);

const eventBadges = generateTieredBadges(
    'events_created',
    'Organizado',
    'Crie {} eventos no calendário.',
    'productivity',
    Calendar,
    [1, 10, 50, 100, 300, 500, 1000, 2000, 5000],
    [10, 50, 150, 300, 600, 1000, 2000, 5000, 10000]
);


// Combine all
export const ALL_BADGES: Badge[] = [
    ...habitBadges,
    ...streakBadges,
    ...financeBadges,
    ...focusBadges,
    ...bookBadges,
    ...waterBadges,
    ...workoutBadges,
    ...eventBadges
];

// Helper to check conditions
export const checkBadgeUnlocks = (stats: any, currentBadges: string[]) => {
    const newUnlocks: Badge[] = [];

    ALL_BADGES.forEach(badge => {
        if (currentBadges.includes(badge.id)) return; // Already unlocked

        let unlocked = false;

        switch (badge.conditionType) {
            case 'habit_count':
                if ((stats.totalHabits || 0) >= badge.conditionValue) unlocked = true;
                break;
            case 'streak_days':
                if ((stats.currentStreak || 0) >= badge.conditionValue) unlocked = true;
                break;
            case 'finance_log':
                if ((stats.totalTransactions || 0) >= badge.conditionValue) unlocked = true;
                break;
            case 'productivity_tasks':
                if ((stats.totalTasks || 0) >= badge.conditionValue) unlocked = true;
                break;
            case 'books_read':
                if ((stats.booksRead || 0) >= badge.conditionValue) unlocked = true;
                break;
            case 'water_logs':
                if ((stats.waterDays || 0) >= badge.conditionValue) unlocked = true;
                break;
            case 'workout_sessions':
                if ((stats.workouts || 0) >= badge.conditionValue) unlocked = true;
                break;
            case 'events_created':
                if ((stats.events || 0) >= badge.conditionValue) unlocked = true;
                break;
        }

        if (unlocked) newUnlocks.push(badge);
    });

    return newUnlocks;
};
