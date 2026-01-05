import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "react-router-dom";
import { User } from "lucide-react";

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const { user, isLoading } = useAuth();
    // Show standard mobile profile button on all pages except Layout Profile page itself
    // This ensures consistency across Dashboard, Finances, and inner pages
    const showGlobalMobileProfile = location.pathname !== '/profile';

    // Auth loading state or no user (handled by auth flow usually, but safe guard)
    if (isLoading) return <>{children}</>;
    if (!user) return <>{children}</>;

    return (
        <div className="flex min-h-screen w-full bg-background text-foreground">
            {/* Desktop Sidebar (Left) */}
            <Sidebar />

            {/* Main Content Area */}
            {/* md:pl-64 pushes content to the right on desktop to make room for sidebar */}
            {/* pb-24 adds padding at bottom for mobile nav to not overlap content */}
            <main className="flex-1 w-full md:pl-64 transition-all duration-300">
                <div className="mx-auto w-full px-4 pt-[calc(4.5rem+env(safe-area-inset-top))] pb-32 md:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden">
                <BottomNav />
            </div>

            {/* Global Mobile Profile Button (Floating Top Right) */}
            {/* Creates a consistent way to access profile on screens like Habits, Calendar, etc. */}
            <div className="md:hidden">
                {showGlobalMobileProfile && (
                    <header
                        className="fixed top-0 left-0 right-0 z-50 bg-black/85 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/5 px-4 flex items-center justify-between transition-all duration-300"
                        style={{
                            paddingTop: "env(safe-area-inset-top)",
                            height: "calc(3.5rem + env(safe-area-inset-top))"
                        }}
                    >
                        <div className="flex items-center h-14 w-full justify-between items-end pb-2">
                            <div className="flex items-center gap-2">
                                <img src="/logo.png" alt="Segundo Cérebro" className="h-8 w-auto object-contain" />
                                <span className="font-bold text-sm tracking-tight hidden xs:block">Segundo Cérebro</span>
                            </div>

                            <Link to="/profile">
                                <div className="w-9 h-9 rounded-full bg-zinc-900/50 border border-white/10 flex items-center justify-center active:scale-95 transition-transform">
                                    <User className="w-4 h-4 text-[#EBFF57]" />
                                </div>
                            </Link>
                        </div>
                    </header>
                )}
            </div>
        </div>
    );
}
