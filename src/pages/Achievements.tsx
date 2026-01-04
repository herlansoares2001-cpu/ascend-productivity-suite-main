
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { useBadges } from "@/hooks/useBadges";
import { BadgeGallery } from "@/components/profile/BadgeGallery";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export default function Achievements() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Mock Stats (In the future, fetch these from Supabase: habits, transactions, etc.)
    const [stats] = useState({
        totalHabits: 150,
        currentStreak: 15,
        totalTransactions: 55,
        totalTasks: 120,
        booksRead: 5,
        waterDays: 45,
        workouts: 30,
        events: 25
    });

    const { level, progress: xpProgress } = useGamification();
    const { allBadges, userBadges, newUnlock, clearNewUnlock } = useBadges(stats);

    useEffect(() => {
        if (newUnlock) {
            const badge = allBadges.find(b => b.id === newUnlock);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#EBFF57', '#A2F7A1', '#3B82F6']
            });
            toast.success(`Nova Conquista: ${badge?.name}!`);
        }
    }, [newUnlock, allBadges]);

    return (
        <div className="page-container pb-24">
            {/* Header */}
            <header className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        Galeria de Troféus <Trophy className="w-6 h-6 text-[#E9FF57]" />
                    </h1>
                    <p className="text-sm text-zinc-400">Suas conquistas e marcos no Ascend.</p>
                </div>
            </header>

            {/* Level Card */}
            <motion.div
                className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-zinc-400 mb-1">Nível Atual</p>
                        <h2 className="text-4xl font-bold text-white mb-2">{level}</h2>
                        <div className="flex items-center gap-2 text-xs text-[#E9FF57]">
                            <span>{Math.round(xpProgress)}% para o próximo nível</span>
                        </div>
                    </div>
                    <div className="w-20 h-20 rounded-full border-4 border-[#E9FF57]/20 flex items-center justify-center bg-[#E9FF57]/5">
                        <Trophy className="w-8 h-8 text-[#E9FF57]" />
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6 h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-[#E9FF57] shadow-[0_0_15px_rgba(235,255,87,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
            </motion.div>

            {/* Grid */}
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Emblemas Conquistados</h3>
                <span className="text-xs font-mono bg-[#E9FF57]/10 text-[#E9FF57] px-2 py-1 rounded-md">
                    {userBadges.length}/{allBadges.length}
                </span>
            </div>

            <BadgeGallery userBadges={userBadges} />

            {/* Celebration Modal */}
            <Dialog open={!!newUnlock} onOpenChange={(open) => !open && clearNewUnlock()}>
                <DialogContent className="sm:max-w-md text-center bg-zinc-950 border-[#E9FF57]/20">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-center text-[#E9FF57]">Parabéns!</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 flex flex-col items-center">
                        <div className="text-6xl mb-4 animate-bounce">
                            {allBadges.find(b => b.id === newUnlock)?.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">
                            Você desbloqueou "{allBadges.find(b => b.id === newUnlock)?.name}"
                        </h3>
                        <p className="text-muted-foreground">
                            {allBadges.find(b => b.id === newUnlock)?.description}
                        </p>
                        <div className="mt-4 inline-block bg-[#E9FF57]/20 text-[#E9FF57] px-3 py-1 rounded-full text-sm font-bold">
                            +{allBadges.find(b => b.id === newUnlock)?.xpReward} XP
                        </div>
                    </div>
                    <Button onClick={() => clearNewUnlock()} className="w-full bg-[#E9FF57] text-black hover:bg-[#d4e64f]">
                        Continuar
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}
