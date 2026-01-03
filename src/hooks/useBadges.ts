import { useState, useEffect } from 'react';
import { BADGES, getUserBadges, saveUserBadge, UserBadge } from '@/lib/badges';

export interface UserStats {
    daysActive: number;
    streak: number;
    goalsCompleted: number;
}

export function useBadges(stats: UserStats) {
    const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
    const [newUnlock, setNewUnlock] = useState<string | null>(null);

    useEffect(() => {
        setUserBadges(getUserBadges());
    }, []);

    useEffect(() => {
        BADGES.forEach(badge => {
            let qualified = false;
            // Simplified check based on stats passed
            if (badge.criteria === 'time' && stats.daysActive >= badge.threshold) qualified = true;
            if (badge.criteria === 'streak' && stats.streak >= badge.threshold) qualified = true;
            if (badge.criteria === 'goals' && stats.goalsCompleted >= badge.threshold) qualified = true;

            const isUnlocked = userBadges.some(ub => ub.badgeId === badge.id);

            if (qualified && !isUnlocked) {
                saveUserBadge(badge.id);
                setUserBadges(prev => [...prev, { badgeId: badge.id, unlockedAt: new Date().toISOString() }]);
                setNewUnlock(badge.id);
            }
        });
    }, [stats, userBadges]);

    const clearNewUnlock = () => setNewUnlock(null);

    return {
        allBadges: BADGES,
        userBadges,
        newUnlock,
        clearNewUnlock
    };
}
