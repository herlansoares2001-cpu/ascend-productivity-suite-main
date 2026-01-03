import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Badge, BADGES, UserBadge } from "@/core/habits/badges";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BadgeGalleryProps {
    userBadges: UserBadge[];
}

export function BadgeGallery({ userBadges }: BadgeGalleryProps) {
    const isUnlocked = (badgeId: string) => userBadges.some(ub => ub.badgeId === badgeId);

    const categories = {
        'Special': BADGES.filter(b => b.tier === 'special'),
        'Gold': BADGES.filter(b => b.tier === 'gold'),
        'Silver': BADGES.filter(b => b.tier === 'silver'),
        'Bronze': BADGES.filter(b => b.tier === 'bronze'),
    };

    return (
        <div className="space-y-6">
            {Object.entries(categories).map(([category, badges]) => {
                if (badges.length === 0) return null;

                return (
                    <div key={category}>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 pl-1 border-l-2 border-primary/50 ml-1">{category}</h3>
                        <div className="grid grid-cols-4 gap-3">
                            {badges.map(badge => {
                                const unlocked = isUnlocked(badge.id);
                                return (
                                    <TooltipProvider key={badge.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <motion.div
                                                    className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 text-center border relative overflow-hidden transition-all duration-300 ${unlocked ? 'bg-gradient-to-br from-card to-muted border-primary/30 shadow-sm' : 'bg-muted/30 border-dashed opacity-60'}`}
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    <span className={`text-2xl mb-1 ${!unlocked && 'grayscale blur-[1px]'}`}>{badge.icon}</span>
                                                    {!unlocked && <Lock className="w-3 h-3 absolute top-1 right-1 text-muted-foreground" />}
                                                </motion.div>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[200px]">
                                                <p className="font-bold text-sm">{badge.name}</p>
                                                <p className="text-xs text-muted-foreground mb-1">{badge.description}</p>
                                                <p className="text-[10px] text-primary">XP: +{badge.xpReward}</p>
                                                {!unlocked && <p className="text-[10px] text-red-400 mt-1">Requer: {badge.criteria} {badge.threshold}</p>}
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
