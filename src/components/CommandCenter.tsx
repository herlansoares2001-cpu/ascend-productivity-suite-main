import { useEffect, useState } from "react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import {
    Calculator,
    Calendar,
    CreditCard,
    Dumbbell,
    LayoutDashboard,
    Settings,
    Trophy,
    User,
    BookOpen,
    Plus,
    Moon,
    Sun
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function CommandCenter() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Digite um comando ou busque..." />
            <CommandList>
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

                <CommandGroup heading="Ações Rápidas">
                    {/* Placeholder for future add actions - would need to open modals specifically */}
                    <CommandItem onSelect={() => runCommand(() => navigate('/habits'))}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Novo Hábito</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/finances'))}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Nova Transação</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Navegação">
                    <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/calendar'))}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Calendário</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/finances'))}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Finanças</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/habits'))}>
                        <Trophy className="mr-2 h-4 w-4" />
                        <span>Hábitos</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/workout'))}>
                        <Dumbbell className="mr-2 h-4 w-4" />
                        <span>Treino</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Configurações">
                    <CommandItem onSelect={() => runCommand(() => navigate('/profile'))}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/profile/settings'))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurações</span>
                    </CommandItem>
                    {/* Theme Toggle Placeholder - implementation depends on ThemeProvider */}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
