import { useState, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';

export function AccountSettings() {
    const { user } = useAuth();

    // Notifications State - Mocked for now as requested
    const [notifications, setNotifications] = useState({
        habits: true,
        aiBriefing: true,
        financial: false
    });

    useEffect(() => {
        const saved = localStorage.getItem('user_notifications');
        if (saved) setNotifications(JSON.parse(saved));
    }, [user]);

    const handleToggleNotification = (key: keyof typeof notifications) => {
        const newState = { ...notifications, [key]: !notifications[key] };
        setNotifications(newState);
        localStorage.setItem('user_notifications', JSON.stringify(newState));
        toast.success("Preferência salva!");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Notifications */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Bell className="w-5 h-5 text-[#E9FF57]" />
                    <h3 className="font-semibold text-lg">Notificações</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-xl border border-white/5">
                        <div className="space-y-0.5">
                            <Label className="text-base">Lembretes de Hábitos</Label>
                            <p className="text-xs text-muted-foreground">Receba alertas para não quebrar seu streak.</p>
                        </div>
                        <Switch
                            checked={notifications.habits}
                            onCheckedChange={() => handleToggleNotification('habits')}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-xl border border-white/5">
                        <div className="space-y-0.5">
                            <Label className="text-base">Resumo Diário da IA</Label>
                            <p className="text-xs text-muted-foreground">Briefing matinal com suas prioridades.</p>
                        </div>
                        <Switch
                            checked={notifications.aiBriefing}
                            onCheckedChange={() => handleToggleNotification('aiBriefing')}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-xl border border-white/5">
                        <div className="space-y-0.5">
                            <Label className="text-base">Alertas Financeiros</Label>
                            <p className="text-xs text-muted-foreground">Avisos sobre faturas e metas de orçamento.</p>
                        </div>
                        <Switch
                            checked={notifications.financial}
                            onCheckedChange={() => handleToggleNotification('financial')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
