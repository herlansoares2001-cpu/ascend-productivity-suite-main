import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    CheckCircle2,
    Wallet,
    Sparkles,
    LogOut,
    Settings,
    User
} from "lucide-react";
import { AICopilot } from "@/components/AICopilot";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

// Helper for consistent Icons
const Calendar2026Icon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
        <text x="12" y="19" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none">26</text>
    </svg>
);

const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Home" },
    { path: "/finances", icon: Wallet, label: "Finanças" },
    { path: "/habits", icon: CheckCircle2, label: "Hábitos" },
    { path: "/calendar", icon: Calendar2026Icon, label: "2026" },
];

export function Sidebar() {
    const location = useLocation();
    const { signOut } = useAuth();

    return (
        <div className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-white/5 bg-zinc-950/50 backdrop-blur-xl p-4 z-50">
            {/* 1. Header Logo */}
            <div className="flex items-center gap-2 px-2 py-6 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-lime-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="font-bold text-lg tracking-tight">Ascend</span>
            </div>

            {/* 2. Main Navigation */}
            <div className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <RouterNavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 bg-primary/10 rounded-xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Icon className={cn("w-5 h-5 relative z-10", isActive && "text-primary")} />
                            <span className="relative z-10">{item.label}</span>
                        </RouterNavLink>
                    );
                })}

                {/* AI Trigger in Sidebar */}
                <div className="pt-4 mt-4 border-t border-white/5">
                    <div className="px-2 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Ferramentas
                    </div>
                    <AICopilot customTrigger={
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-left group">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all">
                                <Sparkles className="w-3 h-3 text-white" />
                            </div>
                            <span>AI Copilot</span>
                        </button>
                    } />
                </div>
            </div>

            {/* 3. Footer / User */}
            <div className="pt-4 border-t border-white/5 space-y-1">
                <RouterNavLink
                    to="/profile"
                    className={({ isActive }) => cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                        isActive
                            ? "bg-white/5 text-white"
                            : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                    )}
                >
                    <User className="w-5 h-5" />
                    <span>Perfil</span>
                </RouterNavLink>

                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-left"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                </button>
            </div>
        </div>
    );
}
