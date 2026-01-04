import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { ALL_BADGES, Badge } from "@/lib/gamification";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BadgeGalleryProps {
    userBadges: { badgeId: string; unlockedAt: string }[];
}

const CATEGORY_LABELS: Record<string, string> = {
    'habits': 'Hábitos',
    'finances': 'Finanças',
    'productivity': 'Produtividade',
    'health': 'Saúde',
    'learning': 'Conhecimento',
    'social': 'Social'
};

export function BadgeGallery({ userBadges }: BadgeGalleryProps) {
    const isUnlocked = (badgeId: string) => userBadges.some(ub => ub.badgeId === badgeId);

    // Group badges by category
    const badgesByCategory = ALL_BADGES.reduce((acc, badge) => {
        const cat = badge.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(badge);
        return acc;
    }, {} as Record<string, Badge[]>);

    return (
        <div className="space-y-8">
            {Object.entries(badgesByCategory).map(([category, badges]) => {
                if (badges.length === 0) return null;

                return (
                    <div key={category}>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 pl-1 border-l-2 border-[#E9FF57]/50 ml-1">
                            {CATEGORY_LABELS[category] || category}
                        </h3>
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                            {badges.map(badge => {
                                const unlocked = isUnlocked(badge.id);
                                const Icon = badge.icon;

                                return (
                                    <TooltipProvider key={badge.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <motion.div
                                                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center border relative overflow-hidden transition-all duration-300 ${unlocked
                                                            ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-[#E9FF57]/30 shadow-[0_0_10px_-5px_#E9FF57]'
                                                            : 'bg-zinc-900/50 border-white/5 opacity-50'
                                                        }`}
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    <div className={`p-2 rounded-full mb-1 ${unlocked ? 'bg-[#E9FF57]/10 text-[#E9FF57]' : 'bg-black/20 text-muted-foreground'}`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>

                                                    {/* Tier Dots */}
                                                    <div className="flex gap-0.5 mt-1">
                                                        {Array.from({ length: Math.min(badge.tier, 5) }).map((_, i) => (
                                                            <div key={i} className={`w-1 h-1 rounded-full ${unlocked ? 'bg-[#E9FF57]' : 'bg-zinc-700'}`} />
                                                        ))}
                                                    </div>

                                                    {!unlocked && <Lock className="w-3 h-3 absolute top-2 right-2 text-muted-foreground/50" />}
                                                </motion.div>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[200px] bg-zinc-900 border-white/10 text-white">
                                                <p className="font-bold text-sm text-[#E9FF57]">{badge.name}</p>
                                                <p className="text-xs text-zinc-400 mb-2">{badge.description}</p>
                                                <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider">
                                                    <span className="text-zinc-500">Tier {badge.tier}</span>
                                                    <span className="text-[#E9FF57]">+{badge.xpReward} XP</span>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
