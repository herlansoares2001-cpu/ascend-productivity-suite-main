import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { XP_TABLE, MAX_LEVEL } from '@/lib/gamification';

export function useGamification() {
    const { user } = useAuth();
    const [level, setLevel] = useState(1);
    const [currentXP, setCurrentXP] = useState(0);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);

    // Get XP required for the NEXT level
    // If level is 1, we need XP_TABLE[2] to reach level 2.
    // If max level, we just show max value.
    const nextLevelXP = XP_TABLE[level + 1] || XP_TABLE[MAX_LEVEL] || 100;

    const progress = Math.min((currentXP / nextLevelXP) * 100, 100);

    useEffect(() => {
        if (!user) return;
        fetchProfile();

        const channel = supabase
            .channel('gamification_updates')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
                (payload: any) => {
                    const params = payload.new;
                    if (params) {
                        setLevel(params.level || 1);
                        setCurrentXP(params.current_xp || 0);
                        setStreak(params.current_streak || 0);
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };

    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('level, current_xp, current_streak')
                .eq('id', user?.id)
                .single();

            if (data) {
                setLevel(data.level || 1);
                setCurrentXP(data.current_xp || 0);
                setStreak(data.current_streak || 0);
            }
        } catch (error) {
            console.error("Error fetching gamification:", error);
        } finally {
            setLoading(false);
        }
    };

    const awardXP = async (amount: number, reason?: string) => {
        if (!user) return;

        let newXP = currentXP + amount;
        let newLevel = level;
        let leveledUp = false;

        // Loop to handle multi-level jumps
        // While we have enough XP for next level and NOT at max level
        while (newLevel < MAX_LEVEL) {
            const threshold = XP_TABLE[newLevel + 1];
            if (newXP >= threshold) {
                newXP -= threshold;
                newLevel++;
                leveledUp = true;
            } else {
                break;
            }
        }

        // Optimistic
        setCurrentXP(newXP);
        setLevel(newLevel);

        // DB Update
        const { error } = await supabase.from('profiles').update({
            current_xp: Math.round(newXP),
            level: newLevel,
            last_active_date: new Date().toISOString()
        }).eq('id', user.id);


        if (!error) {
            toast.success(`+${amount} XP`, {
                description: reason
            });

            if (leveledUp) {
                triggerLevelUpEffect(newLevel);
            }
        }
    };

    const triggerLevelUpEffect = (lvl: number) => {
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#a3e635', '#ffffff', '#000000'] // Lime theme
        });

        toast("LEVEL UP!", {
            description: `Você alcançou o nível ${lvl}!`,
            className: "bg-primary text-primary-foreground border-2 border-white",
            duration: 5000,
            icon: "🚀"
        });
    };

    return {
        level,
        currentXP,
        nextLevelXP,
        progress,
        awardXP,
        streak,
        loading
    };
}
