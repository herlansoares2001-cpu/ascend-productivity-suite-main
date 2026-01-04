import { useState } from 'react';
import {
    Moon, Settings as SettingsIcon, Bell, Shield, Lock, Download,
    HelpCircle, FileText, LogOut, ChevronRight, User, Palette, FolderOpen, Trophy
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function ConfigHub() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    // Mock States for Toggles
    const [notifications, setNotifications] = useState({
        habits: true,
        ai: true,
        bills: false
    });

    const [appLock, setAppLock] = useState(false);

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => {
            const newState = { ...prev, [key]: !prev[key] };
            toast.success("Preferência atualizada");
            return newState;
        });
    };

    const toggleAppLock = () => {
        setAppLock(!appLock);
        toast.success(appLock ? "Bloqueio por PIN desativado" : "Bloqueio por PIN ativado");
    };

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

            {/* 1. Profile Header Card */}
            <div className="bg-card border border-white/5 rounded-3xl p-6 mb-8 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-[#E9FF57]">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-semibold text-lg text-white">{user?.user_metadata?.full_name || 'Usuário Ascend'}</h2>
                        <p className="text-sm text-zinc-400 mb-1">{user?.email}</p>
                        <Badge className="bg-[#E9FF57]/20 text-[#E9FF57] hover:bg-[#E9FF57]/30 border-0 text-[10px] px-2 py-0.5 h-auto">
                            Ascend Pro
                        </Badge>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="hidden sm:flex text-zinc-400 hover:text-white">
                    Editar
                </Button>
            </div>

            {/* Settings Lists */}
            <div className="space-y-6">

                {/* Group: Preferences */}
                <div className="space-y-1">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-4 mb-2">Preferências</h3>
                    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-lg">
                        <MenuItem icon={Trophy} label="Galeria de Troféus" onClick={() => navigate('/achievements')} />
                        <MenuItem icon={Palette} label="Aparência (Tema)" onClick={() => toast.info("Em breve: Seletor de Tema")} />
                        <MenuItem icon={FolderOpen} label="Categorias" onClick={() => toast.info("Em breve: Gestão de Categorias")} />
                    </div>
                </div>

                {/* Group: Notifications */}
                <div className="space-y-1">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-4 mb-2">Notificações</h3>
                    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-lg">
                        <SwitchItem icon={Bell} label="Lembretes de Hábitos" checked={notifications.habits} onCheckedChange={() => toggleNotification('habits')} />
                        <SwitchItem icon={Bell} label="Resumo Diário (IA)" checked={notifications.ai} onCheckedChange={() => toggleNotification('ai')} />
                        <SwitchItem icon={Bell} label="Vencimento de Faturas" checked={notifications.bills} onCheckedChange={() => toggleNotification('bills')} />
                    </div>
                </div>

                {/* Group: Security */}
                <div className="space-y-1">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-4 mb-2">Segurança</h3>
                    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-lg">
                        <SwitchItem icon={Shield} label="Bloqueio do App (PIN)" checked={appLock} onCheckedChange={toggleAppLock} />
                        <MenuItem icon={Lock} label="Alterar Senha" onClick={() => toast.info("Em breve: Alteração de Senha")} />
                    </div>
                </div>

                {/* Group: Data & Support */}
                <div className="space-y-1">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-4 mb-2">Dados e Suporte</h3>
                    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-lg">
                        <MenuItem icon={Download} label="Exportar Dados" onClick={() => toast.success("Relatório gerado!")} />
                        <MenuItem icon={HelpCircle} label="Ajuda e Suporte" onClick={() => window.open('https://support.ascend.com', '_blank')} />
                        <MenuItem icon={FileText} label="Termos de Uso" showArrow={false} onClick={() => window.open('/terms', '_blank')} />
                    </div>
                </div>

            </div>

            {/* Footer / Danger Zone */}
            <div className="mt-12 flex flex-col items-center gap-4">
                <Button
                    variant="ghost"
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10 w-full max-w-xs"
                    onClick={() => signOut()}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair da Conta
                </Button>
                <p className="text-[10px] text-zinc-600">Versão 1.0.0 (Beta)</p>
            </div>

        </div>
    );
}
