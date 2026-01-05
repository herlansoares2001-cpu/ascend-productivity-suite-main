import { useState, useEffect } from 'react';
import {
    Moon, Settings as SettingsIcon, Bell, Shield, Lock, Download,
    HelpCircle, FileText, LogOut, ChevronRight, User, Palette, FolderOpen, Trophy,
    Smartphone, Sun
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { DangerZone } from "@/components/profile/settings/DangerZone";

export function ConfigHub() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    // --- STATES ---
    // Load preferences from localStorage or default
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('ascend_notifications');
        return saved ? JSON.parse(saved) : { habits: true, ai: true, bills: false };
    });

    const [appLock, setAppLock] = useState(() => {
        return localStorage.getItem('ascend_app_lock') === 'true';
    });

    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Default to dark or check system
        return localStorage.getItem('ascend_theme') !== 'light';
    });

    // Password Dialog State
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);

    // Import State
    const [isImporting, setIsImporting] = useState(false);

    // --- EFFECTS ---
    useEffect(() => {
        localStorage.setItem('ascend_notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem('ascend_app_lock', String(appLock));
    }, [appLock]);

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('ascend_theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('ascend_theme', 'light');
        }
    }, [isDarkMode]);


    // --- HANDLERS ---
    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications((prev: any) => {
            const newState = { ...prev, [key]: !prev[key] };
            toast.success("Preferência salva");
            return newState;
        });
    };

    const toggleAppLock = () => {
        setAppLock(!appLock);
        toast.success(appLock ? "Bloqueio removido" : "Bloqueio ativado (Simulado)");
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        toast.success(isDarkMode ? "Modo Claro ativado" : "Modo Escuro ativado");
    };

    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                setIsImporting(true);
                toast.loading("Importando dados...");

                // Validate structure briefly?
                if (!json.habits && !json.transactions) {
                    throw new Error("Formato de arquivo inválido.");
                }

                // Insert Data (Parallel)
                // Note: We need to strip IDs to avoid conflicts or upsert?
                // Strategy: Insert as new records to avoid ID collision, relying on user_id.
                // But if they are just restoring, maybe they want original IDs?
                // Let's strip IDs for safety unless using upsert.
                // Actually, simple restore usually implies "add this data".

                const cleanData = (arr: any[]) => arr?.map(({ id, created_at, ...rest }: any) => ({
                    ...rest,
                    user_id: user.id // Ensure it belongs to current user
                })) || [];

                await Promise.all([
                    json.habits?.length ? supabase.from('habits').insert(cleanData(json.habits)) : Promise.resolve(),
                    json.transactions?.length ? supabase.from('transactions').insert(cleanData(json.transactions)) : Promise.resolve(),
                    json.tasks?.length ? supabase.from('tasks').insert(cleanData(json.tasks)) : Promise.resolve(),
                ]);

                toast.dismiss();
                toast.success("Dados importados com sucesso!");
                window.location.reload();

            } catch (error: any) {
                console.error(error);
                toast.dismiss();
                toast.error("Erro ao importar: " + error.message);
            } finally {
                setIsImporting(false);
            }
        };
        reader.readAsText(file);
    };

    const triggerImport = () => {
        document.getElementById('import-file')?.click();
    };

    const handleExportData = async () => {
        if (!user) return;
        toast.loading("Gerando relatório...");

        try {
            const [habits, transactions, tasks] = await Promise.all([
                supabase.from('habits').select('*').eq('user_id', user.id),
                supabase.from('transactions').select('*').eq('user_id', user.id),
                supabase.from('tasks').select('*').eq('user_id', user.id),
            ]);

            const data = {
                user: { email: user.email, name: user.user_metadata.full_name },
                exported_at: new Date().toISOString(),
                habits: habits.data,
                transactions: transactions.data,
                tasks: tasks.data
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ascend_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.dismiss();
            toast.success("Download iniciado!");
        } catch (error) {
            toast.dismiss();
            toast.error("Erro ao gerar relatório");
            console.error(error);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres");
            return;
        }
        if (!currentPassword) {
            toast.error("Digite sua senha atual");
            return;
        }

        setIsLoadingPassword(true);

        try {
            // Verify old password by signing in (hacky but functional for Supabase client side)
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user?.email || "",
                password: currentPassword
            });

            if (signInError) {
                throw new Error("Senha atual incorreta.");
            }

            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) throw error;

            toast.success("Senha atualizada com sucesso!");
            setIsPasswordOpen(false);
            setNewPassword("");
            setCurrentPassword("");

        } catch (error: any) {
            toast.error(error.message || "Erro ao atualizar senha");
        } finally {
            setIsLoadingPassword(false);
        }
    };

    // --- COMPONENTS ---
    const MenuItem = ({ icon: Icon, label, onClick, showArrow = true, danger = false }: any) => (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors active:bg-white/10",
                danger && "text-red-500 hover:bg-red-500/10"
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg bg-secondary/20", danger && "bg-red-500/20")}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm">{label}</span>
            </div>
            {showArrow && <ChevronRight className="w-4 h-4 text-muted-foreground/50" />}
        </div>
    );

    const SwitchItem = ({ icon: Icon, label, checked, onCheckedChange }: any) => (
        <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20">
                    <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm">{label}</span>
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto pb-12 animate-in slide-in-from-bottom-4 duration-500">
            {/* Hidden File Input */}
            <input
                type="file"
                id="import-file"
                className="hidden"
                accept=".json"
                onChange={handleImportData}
            />

            {/* 1. Profile Header Card */}
            <div className="bg-card border border-white/5 rounded-3xl p-6 mb-8 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-[#E9FF57]">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar >
                    <div>
                        <h2 className="font-semibold text-lg text-foreground">{user?.user_metadata?.full_name || 'Usuário Ascend'}</h2>
                        <p className="text-sm text-zinc-400 mb-1">{user?.email}</p>
                        <Badge className="bg-[#E9FF57]/20 text-[#E9FF57] hover:bg-[#E9FF57]/30 border-0 text-[10px] px-2 py-0.5 h-auto">
                            Ascend Pro (Lvl {user?.user_metadata?.level || 1})
                        </Badge>
                    </div>
                </div >
                <Button variant="ghost" size="sm" className="flex text-muted-foreground hover:text-foreground" onClick={() => navigate('/profile/edit')}>
                    Editar
                </Button>
            </div >

            {/* Settings Lists */}
            < div className="space-y-6" >

                {/* Group: Preferences */}
                < div className="space-y-1" >
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 mb-2">Preferências</h3>
                    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-lg">
                        <MenuItem icon={User} label="Editar Perfil" onClick={() => navigate('/profile/edit')} />
                        <MenuItem icon={Trophy} label="Galeria de Troféus" onClick={() => navigate('/achievements')} />
                        <MenuItem
                            icon={isDarkMode ? Moon : Sun}
                            label={`Tema: ${isDarkMode ? 'Escuro' : 'Claro'}`}
                            onClick={toggleTheme}
                        />
                        {/* Removed Categorias */}
                    </div>
                </div >

                {/* Group: Notifications */}
                < div className="space-y-1" >
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 mb-2">Notificações Local</h3>
                    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-lg">
                        <SwitchItem icon={Bell} label="Lembretes de Hábitos" checked={notifications.habits} onCheckedChange={() => toggleNotification('habits')} />
                        <SwitchItem icon={Bell} label="Resumo Diário (IA)" checked={notifications.ai} onCheckedChange={() => toggleNotification('ai')} />
                    </div>
                </div >

                {/* Group: Security */}
                < div className="space-y-1" >
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 mb-2">Segurança</h3>
                    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-lg">
                        <SwitchItem icon={Smartphone} label="Bloqueio do App (PIN)" checked={appLock} onCheckedChange={toggleAppLock} />
                        <MenuItem icon={Lock} label="Alterar Senha" onClick={() => setIsPasswordOpen(true)} />
                    </div>
                </div >

                {/* Group: Data & Support */}
                < div className="space-y-1" >
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 mb-2">Dados e Suporte</h3>
                    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-lg">
                        <MenuItem icon={Download} label="Exportar Meus Dados (Backup)" onClick={handleExportData} />
                        <MenuItem icon={Download} label="Importar Dados (Restaurar)" onClick={triggerImport} />
                        <MenuItem icon={HelpCircle} label="Ajuda e Suporte" onClick={() => window.open('https://support.google.com', '_blank')} />
                        <MenuItem icon={FileText} label="Termos de Uso" showArrow={false} onClick={() => window.open('#', '_blank')} />
                    </div>
                </div >

                {/* Group: Danger Zone */}
                <DangerZone />

            </div >

            {/* Footer */}
            < div className="mt-12 flex flex-col items-center gap-4" >
                <Button variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 w-full max-w-xs" onClick={() => signOut()}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair da Conta
                </Button>
                <p className="text-[10px] text-zinc-600">Versão 1.2.0 (Beta)</p>
            </div >

            {/* --- DIALOGS --- */}
            < Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen} >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Alterar Senha</DialogTitle>
                        <DialogDescription>
                            Para sua segurança, confirme sua senha atual antes de definir uma nova.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="old-password">Senha Atual</Label>
                            <Input
                                id="old-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Digite sua senha atual"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new-password">Nova Senha</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPasswordOpen(false)}>Cancelar</Button>
                        <Button onClick={handleChangePassword} disabled={isLoadingPassword}>
                            {isLoadingPassword ? "Verificando..." : "Alterar Senha"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

        </div >
    );
}
