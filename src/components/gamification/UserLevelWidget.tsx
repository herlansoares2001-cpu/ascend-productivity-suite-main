import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";

export function UserLevelWidget() {
    const { user } = useAuth();
    const { level, progress, currentXP, nextLevelXP, loading } = useGamification();

    if (loading) return (
        <div className="h-14 w-full bg-muted/20 animate-pulse rounded-xl" />
    );

    return (
        <div className="flex items-center gap-3 bg-card p-2 rounded-xl border border-border/50 shadow-sm min-w-[200px]">
            <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.email?.[0].toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-background shadow-sm">
                    Lv{level}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5 px-0.5">
                    <span className="font-medium text-foreground">{currentXP} XP</span>
                    <span>{nextLevelXP} XP</span>
                </div>
                <Progress value={progress} className="h-1.5" />
            </div>
        </div>
    );
}
