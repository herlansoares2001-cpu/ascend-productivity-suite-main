import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, Trophy, Settings, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { useBadges } from "@/hooks/useBadges";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import confetti from "canvas-confetti";
import { toast } from "sonner";

// Modules
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { BadgeGallery } from "@/components/profile/BadgeGallery";
import { SettingsSection } from "@/components/profile/SettingsSection";
import { HelpSection } from "@/components/profile/HelpSection";

export default function Profile() {
    const { user, signOut } = useAuth();

    // Mock Stats for demonstration (Badges still rely on this for now)
    const [stats, setStats] = useState({
        daysActive: 45,
        streak: 30,
        goalsCompleted: 2
    });

    // New Gamification Hook (Live XP from Global State/DB)
    const { level, progress: xpProgress } = useGamification();

    // Legacy Badges Hook
    const { allBadges, userBadges, newUnlock, clearNewUnlock } = useBadges(stats);

    // Celebration Effect
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

    const handleUpdateProfile = (data: any) => {
        console.log("Saving profile", data);
        toast.success("Perfil atualizado! (Simulação)");
    };

    return (
        <div className="page-container pb-24">

            {/* 1. Identity & XP (Always Visible) */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <ProfileHeader
                    user={user}
                    level={level}
                    xpProgress={xpProgress}
                    onUpdateProfile={handleUpdateProfile}
                />
            </motion.div>

            {/* 2. Content Tabs */}
            <Tabs defaultValue="achievements" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 h-12">
                    <TabsTrigger value="achievements" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                        <Trophy className="w-4 h-4" /> <span className="hidden sm:inline">Conquistas</span>
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                        <Settings className="w-4 h-4" /> <span className="hidden sm:inline">Ajustes</span>
                    </TabsTrigger>
                    <TabsTrigger value="help" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                        <HelpCircle className="w-4 h-4" /> <span className="hidden sm:inline">Ajuda</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="achievements" className="animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold">Galeria de Troféus</h2>
                            <p className="text-xs text-muted-foreground">Desbloqueie emblemas completando metas.</p>
                        </div>
                        <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded-md">
                            {userBadges.length}/{allBadges.length}
                        </span>
                    </div>
                    <BadgeGallery userBadges={userBadges} />
                </TabsContent>

                <TabsContent value="settings" className="animate-in slide-in-from-bottom-2 duration-300">
                    <SettingsSection />
                </TabsContent>

                <TabsContent value="help" className="animate-in slide-in-from-bottom-2 duration-300">
                    <HelpSection />
                </TabsContent>
            </Tabs>

            <div className="flex justify-center mt-12 mb-4">
                <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => signOut()}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair da Conta
                </Button>
            </div>

            {/* Celebration Modal */}
            <Dialog open={!!newUnlock} onOpenChange={(open) => !open && clearNewUnlock()}>
                <DialogContent className="sm:max-w-md text-center">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-center">Parabéns!</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 flex flex-col items-center">
                        <div className="text-6xl mb-4 animate-bounce">
                            {allBadges.find(b => b.id === newUnlock)?.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2">
                            Você desbloqueou "{allBadges.find(b => b.id === newUnlock)?.name}"
                        </h3>
                        <p className="text-muted-foreground">
                            {allBadges.find(b => b.id === newUnlock)?.description}
                        </p>
                        <div className="mt-4 inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-bold">
                            +{allBadges.find(b => b.id === newUnlock)?.xpReward} XP
                        </div>
                    </div>
                    <Button onClick={() => clearNewUnlock()} className="w-full">
                        Continuar
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}
