import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from 'lucide-react';
import { toast } from "sonner";
import { cn } from '@/lib/utils';

export function ModuleSettings() {
    // Mock settings - In real app, load from DB
    const [settings, setSettings] = useState({
        googleCalendarConnected: false
    });

    useEffect(() => {
        const saved = localStorage.getItem('module_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSettings({
                    googleCalendarConnected: parsed.googleCalendarConnected || false
                });
            } catch (e) {
                console.error("Error parsing settings", e);
            }
        }
    }, []);

    const handleChange = (key: keyof typeof settings, value: boolean) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem('module_settings', JSON.stringify(newSettings));
    };

    const toggleGoogleCalendar = () => {
        // Mock connection toggle
        const newState = !settings.googleCalendarConnected;
        handleChange('googleCalendarConnected', newState);
        if (newState) {
            toast.success("Google Calendar conectado!");
        } else {
            toast.info("Google Calendar desconectado.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 delay-100 pt-4">
            {/* Integrations */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Calendar className="w-5 h-5 text-[#E9FF57]" />
                    <h3 className="font-semibold text-lg">Integrações</h3>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="GCal" className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-medium">Google Calendar</p>
                            <p className={cn("text-xs", settings.googleCalendarConnected ? "text-green-400" : "text-zinc-500")}>
                                {settings.googleCalendarConnected ? "Conectado" : "Desconectado"}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant={settings.googleCalendarConnected ? "outline" : "default"}
                        size="sm"
                        onClick={toggleGoogleCalendar}
                        className={cn(
                            settings.googleCalendarConnected
                                ? "border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                : "bg-white text-black hover:bg-gray-200"
                        )}
                    >
                        {settings.googleCalendarConnected ? "Desconectar" : "Conectar"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
