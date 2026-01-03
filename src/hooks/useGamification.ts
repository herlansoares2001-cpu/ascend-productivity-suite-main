import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export function useGamification() {
    const { user } = useAuth();
    const [level, setLevel] = useState(1);
    const [currentXP, setCurrentXP] = useState(0);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);

    // Formula: XP to complete current level
    const nextLevelXP = Math.round(level * 100 * 1.5);
    const progress = Math.min((currentXP / nextLevelXP) * 100, 100);

    useEffect(() => {
        if (!user) return;
        fetchProfile();

        // Subscribe to realtime changes? Optional, but good.
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

        const threshold = Math.round(newLevel * 100 * 1.5);

        // Check level up (while loop for multiple level ups?)
        if (newXP >= threshold) {
            newLevel++;
            newXP = newXP - threshold;
            leveledUp = true;
        }

        // Optimistic
        setCurrentXP(newXP);
        setLevel(newLevel);

        // DB Update
        const { error } = await supabase.from('profiles').update({
            current_xp: Math.round(newXP),
            level: newLevel,
            last_active_date: new Date().toISOString()
        } as any).eq('id', user.id);
        // Cast as any because types.ts might not be fully updated yet

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
