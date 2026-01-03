import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Shield, RotateCcw, Trophy, Clock } from "lucide-react";
import { Streak } from "@/types/streak";
import { differenceInSeconds } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface StreakCounterProps {
    streak: Streak;
    onReset: (id: string, reason: string) => void;
    onDelete: (id: string) => void;
}

export function StreakCounter({ streak, onReset, onDelete }: StreakCounterProps) {
    const [duration, setDuration] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [resetReason, setResetReason] = useState("");

    // Update Timer every second
    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const start = new Date(streak.last_relapse_date);
            const totalSeconds = differenceInSeconds(now, start);

            const days = Math.floor(totalSeconds / (3600 * 24));
            const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            setDuration({ days, hours, minutes, seconds });
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [streak.last_relapse_date]);

    const isGoodHabit = streak.type === 'maintain_good_habit';
    const accentColor = isGoodHabit ? "text-orange-500" : "text-emerald-500";
    const bgColor = isGoodHabit ? "bg-orange-500/10" : "bg-emerald-500/10";
    const borderColor = isGoodHabit ? "border-orange-500/20" : "border-emerald-500/20";
    const Icon = isGoodHabit ? Flame : Shield;

    const handleConfirmReset = () => {
        onReset(streak.id, resetReason);
        setIsResetDialogOpen(false);
        setResetReason("");
    };

    // Calculate progress towards record
    const currentTotalSeconds = (duration.days * 86400) + (duration.hours * 3600) + (duration.minutes * 60) + duration.seconds;
    const progress = streak.longest_streak_seconds > 0
        ? Math.min((currentTotalSeconds / streak.longest_streak_seconds) * 100, 100)
        : 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative overflow-hidden rounded-2xl p-6 border ${borderColor} ${bgColor} backdrop-blur-sm`}
        >
            {/* Background Glow */}
            <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 ${isGoodHabit ? 'bg-orange-500' : 'bg-emerald-500'}`} />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isGoodHabit ? 'bg-orange-500/20' : 'bg-emerald-500/20'} ${accentColor}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg tracking-tight">{streak.title}</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            {isGoodHabit ? "Manter Hábito" : "Abstinência"}
                        </p>
                    </div>
                </div>

                {streak.longest_streak_seconds > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/40 px-2 py-1 rounded-md border border-white/5" title="Melhor Sequência">
                        <Trophy className="w-3 h-3 text-yellow-500" />
                        <span>Recorde: {Math.floor(streak.longest_streak_seconds / 86400)}d</span>
                    </div>
                )}
            </div>

            {/* Timer Display */}
            <div className="grid grid-cols-4 gap-2 mb-6 relative z-10 text-center">
                <TimeUnit value={duration.days} label="DIAS" accent={accentColor} />
                <TimeUnit value={duration.hours} label="HRS" accent={accentColor} />
                <TimeUnit value={duration.minutes} label="MIN" accent={accentColor} />
                <TimeUnit value={duration.seconds} label="SEG" accent={accentColor} isSeconds />
            </div>

            {/* Progress Bar (vs Record) */}
            {streak.longest_streak_seconds > 0 && (
                <div className="mb-4 relative z-10">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                        <span>Progresso do Recorde</span>
                        <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-background/30 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1 }}
                            className={`h-full rounded-full ${isGoodHabit ? 'bg-orange-500' : 'bg-emerald-500'}`}
                        />
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 relative z-10">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-white/10 hover:bg-white/5 hover:text-white"
                    onClick={() => setIsResetDialogOpen(true)}
                >
                    <RotateCcw className="w-3 h-3 mr-2" />
                    Reiniciar
                </Button>
            </div>

            {/* Reset Dialog */}
            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reiniciar Contador?</DialogTitle>
                        <DialogDescription>
                            Isso vai zerar seu progresso atual. O histórico será salvo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Motivo (Opcional)</Label>
                        <Input
                            placeholder="Ex: Festinha no fim de semana..."
                            value={resetReason}
                            onChange={(e) => setResetReason(e.target.value)}
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsResetDialogOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleConfirmReset}>Confirmar Reinício</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}

function TimeUnit({ value, label, accent, isSeconds = false }: { value: number, label: string, accent: string, isSeconds?: boolean }) {
    return (
        <div className="bg-background/40 backdrop-blur rounded-lg p-2 border border-white/5 flex flex-col items-center justify-center min-w-[60px]">
            <span className={`text-2xl font-bold font-mono ${isSeconds ? accent : 'text-foreground'}`}>
                {value.toString().padStart(2, '0')}
            </span>
            <span className="text-[9px] text-muted-foreground font-medium mt-0.5">{label}</span>
        </div>
    );
}
