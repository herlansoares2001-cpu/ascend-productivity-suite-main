import { useState, useEffect } from 'react';
import { ALL_BADGES, checkBadgeUnlocks, Badge } from '@/lib/gamification';

// Helper to persist to localStorage (Mock DB for badges)
const STORAGE_KEY = 'ascend_user_badges';
const getStoredBadges = (): { badgeId: string; unlockedAt: string }[] => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
};
const saveStoredBadge = (badgeId: string) => {
    const current = getStoredBadges();
    const updated = [...current, { badgeId, unlockedAt: new Date().toISOString() }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export interface UserStats {
    totalHabits?: number;
    currentStreak?: number;
    totalTransactions?: number;
    totalTasks?: number;
    booksRead?: number;
    waterDays?: number;
    workouts?: number;
    events?: number;
    [key: string]: number | undefined;
}

export function useBadges(stats: UserStats) {
    const [userBadges, setUserBadges] = useState<{ badgeId: string; unlockedAt: string }[]>([]);
    const [newUnlock, setNewUnlock] = useState<string | null>(null);

    // Initial Load
    useEffect(() => {
        setUserBadges(getStoredBadges());
    }, []);

    // Check Logic
    useEffect(() => {
        const currentIds = userBadges.map(b => b.badgeId);
        const newUnlocks = checkBadgeUnlocks(stats, currentIds);

        if (newUnlocks.length > 0) {
            newUnlocks.forEach(badge => {
                saveStoredBadge(badge.id);
            });

            // Update local state
            setUserBadges(prev => [
                ...prev,
                ...newUnlocks.map(b => ({ badgeId: b.id, unlockedAt: new Date().toISOString() }))
            ]);

            // Celebrate (Show first one found)
            setNewUnlock(newUnlocks[0].id);
        }
    }, [stats, userBadges]); // Dependent on stats changing

    const clearNewUnlock = () => setNewUnlock(null);

    return {
        allBadges: ALL_BADGES,
        userBadges,
        newUnlock,
        clearNewUnlock
    };
}
