import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GoogleCalendarService } from "@/services/google-calendar";
import { useCalendar } from "@/hooks/useCalendar";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, RefreshCw, CheckCircle, AlertCircle, LogOut } from "lucide-react";

export function IntegrationsSettings() {
    const [isConnected, setIsConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);
    const { calendars, toggleCalendar } = useCalendar();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.provider_token) {
                GoogleCalendarService.setAccessToken(session.provider_token);
                setIsConnected(true);
            } else if (GoogleCalendarService.getAccessToken()) {
                setIsConnected(true);
            }
        };
        checkSession();
    }, []);

    const handleConnect = async () => {
        try {
            await GoogleCalendarService.connect();
        } catch (e) {
            toast.error("Erro ao iniciar conexão");
        }
    };

    const handleDisconnect = () => {
        GoogleCalendarService.setAccessToken(""); // Clear local token
        setIsConnected(false);
        toast.info("Desconectado do dispositivo local.");
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await GoogleCalendarService.syncFull();
            setLastSync(new Date().toLocaleTimeString());
            toast.success("Sincronização concluída! Recarregue para ver os novos eventos.");
            // Optional: window.location.reload();
        } catch (e) {
            console.error(e);
            toast.error("Falha na sincronização. Tente reconectar.");
        } finally {
            setIsSyncing(false);
        }
    };

    const googleCalendars = calendars.filter(c => c.provider === 'google');

    return (
        <div className="space-y-6">
            <div className="border rounded-xl p-4 bg-card">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.5 2C16.9 2 20.8 4.5 22.9 8.2L19.7 10C18.6 8 16.5 6.6 14.1 6.3V2H12.5ZM6.3 7C4.6 8.3 3.4 10.3 3 12.5H1.4V11.2C2 8.3 3.8 5.8 6.3 4.2L8.2 6.3C7.5 6.4 6.9 6.7 6.3 7ZM4.2 16.3C5.8 18.8 8.3 20.6 11.2 21.2V22.8H12.5C10.3 22.4 8.3 21.2 7 19.5L4.2 16.3ZM16.3 19.8L18.8 17.7C19.9 18.2 20.9 18.5 22 18.5V20.1C20.4 20.1 19 19.7 17.7 19.1L16.3 19.8ZM22 12V13.5H19.8C19.9 13 20 12.5 20 12H22Z" />
                                <text x="8" y="16" fontSize="10" fill="currentColor">G</text>
                                {/* Placeholder icon */}
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-medium">Google Agenda</h3>
                            <p className="text-sm text-muted-foreground">
                                {isConnected ? "Conectado" : "Sincronize seus eventos"}
                            </p>
                        </div>
                    </div>
                    <div>
                        {isConnected ? (
                            <Button variant="outline" size="sm" onClick={handleDisconnect}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Desconectar
                            </Button>
                        ) : (
                            <Button onClick={handleConnect}>Conectar</Button>
                        )}
                    </div>
                </div>

                {isConnected && (
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                {lastSync ? `Sincronizado às ${lastSync}` : "Nenhuma sincronização recente"}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSync}
                                disabled={isSyncing}
                            >
                                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                <span className="ml-2">Sincronizar Agora</span>
                            </Button>
                        </div>

                        {googleCalendars.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium">Calendários Disponíveis</h4>
                                {googleCalendars.map(cal => (
                                    <div key={cal.id} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={cal.visible}
                                            onCheckedChange={() => toggleCalendar(cal.id)}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm">{cal.name}</span>
                                            <span className="text-xs text-muted-foreground capitalize">{cal.accessRole}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
