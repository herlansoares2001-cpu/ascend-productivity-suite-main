import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const { user, isLoading } = useAuth();

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
                <div className="mx-auto w-full p-4 md:p-8 pb-32 md:pb-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden">
                <BottomNav />
            </div>
        </div>
    );
}
