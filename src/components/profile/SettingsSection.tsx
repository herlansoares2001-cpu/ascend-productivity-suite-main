import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Shield, Globe, Bell, Trash2, Database, Moon, Sun } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getSettings, saveSettings, AppSettings } from "@/lib/settings-storage";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function SettingsSection() {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const { signOut } = useAuth(); // If delete account, verify logic

    useEffect(() => {
        setSettings(getSettings());
    }, []);

    const update = (fn: (prev: AppSettings) => AppSettings) => {
        setSettings(prev => {
            if (!prev) return null;
            const next = fn(prev);
            saveSettings(next);
            return next;
        });
    };

    const handleClearCache = () => {
        localStorage.clear();
        window.location.reload();
    };

    if (!settings) return null;

    return (
        <Accordion type="single" collapsible className="w-full bg-card rounded-xl border px-2">

            {/* Security */}
            <AccordionItem value="security">
                <AccordionTrigger>
                    <div className="flex items-center gap-3"><Shield className="w-4 h-4 text-primary" /> Segurança</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <Label>Biometria / FaceID</Label>
                        <Switch checked={settings.security.biometricsEnabled} onCheckedChange={(c) => update(s => ({ ...s, security: { ...s.security, biometricsEnabled: c } }))} />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label>Autenticação em 2 Fatores</Label>
                        <Switch checked={settings.security.twoFactorEnabled} onCheckedChange={(c) => update(s => ({ ...s, security: { ...s.security, twoFactorEnabled: c } }))} />
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2">Alterar Senha</Button>
                </AccordionContent>
            </AccordionItem>

            {/* Regional */}
            <AccordionItem value="regional">
                <AccordionTrigger>
                    <div className="flex items-center gap-3"><Globe className="w-4 h-4 text-blue-500" /> Preferências</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                    <div className="grid gap-2">
                        <Label>Moeda Principal</Label>
                        <Select value={settings.preferences.currency} onValueChange={(v: any) => update(s => ({ ...s, preferences: { ...s.preferences, currency: v } }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BRL">Real (BRL)</SelectItem>
                                <SelectItem value="USD">Dólar (USD)</SelectItem>
                                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between">
                        <Label>Modo Escuro</Label>
                        <div className="flex items-center gap-2 border rounded-full p-1">
                            <Button size="icon" variant={settings.preferences.theme === 'light' ? 'secondary' : 'ghost'} className="h-6 w-6 rounded-full" onClick={() => update(s => ({ ...s, preferences: { ...s.preferences, theme: 'light' } }))}><Sun className="w-3 h-3" /></Button>
                            <Button size="icon" variant={settings.preferences.theme === 'dark' ? 'secondary' : 'ghost'} className="h-6 w-6 rounded-full" onClick={() => update(s => ({ ...s, preferences: { ...s.preferences, theme: 'dark' } }))}><Moon className="w-3 h-3" /></Button>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>

            {/* Notifications */}
            <AccordionItem value="notifications">
                <AccordionTrigger>
                    <div className="flex items-center gap-3"><Bell className="w-4 h-4 text-yellow-500" /> Notificações</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <Label>Lembretes de Treino</Label>
                        <Switch checked={settings.notifications.trainings} onCheckedChange={(c) => update(s => ({ ...s, notifications: { ...s.notifications, trainings: c } }))} />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label>Vencimento de Boletos</Label>
                        <Switch checked={settings.notifications.bills} onCheckedChange={(c) => update(s => ({ ...s, notifications: { ...s.notifications, bills: c } }))} />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label>Alertas de Gastos</Label>
                        <Switch checked={settings.notifications.spending} onCheckedChange={(c) => update(s => ({ ...s, notifications: { ...s.notifications, spending: c } }))} />
                    </div>
                </AccordionContent>
            </AccordionItem>

            {/* Data */}
            <AccordionItem value="data">
                <AccordionTrigger>
                    <div className="flex items-center gap-3"><Database className="w-4 h-4 text-purple-500" /> Dados</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                    <Button variant="outline" className="w-full font-normal" onClick={handleClearCache}>
                        <Trash2 className="w-4 h-4 mr-2" /> Limpar Cache do App
                    </Button>
                    <Button variant="outline" className="w-full font-normal">Exportar Dados (CSV)</Button>
                    <div className="pt-4 border-t">
                        <Button variant="destructive" className="w-full" onClick={() => toast.error("Funcionalidade crítica bloqueada na demo.")}>Excluir Minha Conta</Button>
                    </div>
                </AccordionContent>
            </AccordionItem>

        </Accordion>
    );
}
