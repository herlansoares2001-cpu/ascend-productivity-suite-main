import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, Trophy, Settings, HelpCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { useBadges } from "@/hooks/useBadges";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { toast } from "sonner";

// Modules
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { BadgeGallery } from "@/components/profile/BadgeGallery";
import { HelpSection } from "@/components/profile/HelpSection";

// Settings Modules
import { AccountSettings } from "@/components/profile/settings/AccountSettings";
import { ModuleSettings } from "@/components/profile/settings/ModuleSettings";
import { DangerZone } from "@/components/profile/settings/DangerZone";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Profile() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

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

            {/* Back Button (Mobile friendly) */}
            <div className="mb-4 flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-white pl-0">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                </Button>
            </div>

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
            <Tabs defaultValue="achievements" className="w-full mt-6">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/20 p-1 h-14 rounded-2xl border border-white/5">
                    <TabsTrigger value="achievements" className="rounded-xl data-[state=active]:bg-[#E9FF57] data-[state=active]:text-black data-[state=active]:shadow-sm gap-2 h-full transition-all">
                        <Trophy className="w-4 h-4" /> <span className="hidden sm:inline font-medium">Conquistas</span>
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-[#E9FF57] data-[state=active]:text-black data-[state=active]:shadow-sm gap-2 h-full transition-all">
                        <Settings className="w-4 h-4" /> <span className="hidden sm:inline font-medium">Ajustes & Ajuda</span>
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
                    <div className="grid gap-8 max-w-3xl mx-auto">
                        <AccountSettings />
                        <ModuleSettings />
                        <DangerZone />
                        <HelpSection />

                        <div className="flex justify-center mt-12 mb-8">
                            <Button variant="ghost" className="text-muted-foreground hover:text-white" onClick={() => signOut()}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Sair da Conta
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

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
