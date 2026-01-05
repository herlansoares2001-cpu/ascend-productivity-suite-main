import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CheckCircle2,
  Wallet,
  Calendar,
  Sparkles,
  User
} from "lucide-react";
import { AICopilot } from "@/components/AICopilot";

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
  { path: "AI_TRIGGER", icon: Sparkles, label: "IA" },
  { path: "/habits", icon: CheckCircle2, label: "Hábitos" },
  { path: "/calendar", icon: Calendar2026Icon, label: "2026" },
];

export function BottomNav() {
  const location = useLocation();

  const handleInteraction = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  return (
    <motion.nav
      className="fixed z-50 glass rounded-full px-2 py-2 w-[90%] max-w-[380px] md:max-w-[480px]"
      style={{
        boxShadow: "0 8px 32px -4px hsl(0 0% 0% / 0.5), inset 0 1px 0 hsl(0 0% 100% / 0.1)",
        left: "50%",
        marginLeft: "0",
        marginRight: "0",
        bottom: "max(1.5rem, env(safe-area-inset-bottom))" // Lift it up above the home indicator properly
      }}
      initial={{ y: 100, opacity: 0, x: "-50%" }}
      animate={{ y: 0, opacity: 1, x: "-50%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between w-full px-2">
        {navItems.map((item) => {
          if (item.path === "AI_TRIGGER") {
            return (
              <div key="ai-trigger" className="relative -top-6">
                <AICopilot customTrigger={
                  <motion.div
                    onTap={handleInteraction}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4F657] to-[#A3E635] flex items-center justify-center shadow-lg border-[6px] border-background relative overflow-hidden"
                    style={{
                      boxShadow: "0 0 25px rgba(212, 246, 87, 0.4)"
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 blur-sm rounded-full" />
                    <Sparkles className="w-7 h-7 text-black fill-black/10 relative z-10" />
                  </motion.div>
                } />
              </div>
            );
          }

          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
              onClick={handleInteraction}
              className={`nav-item flex-shrink-0 relative ${isActive ? "active" : "text-muted-foreground"}`}
            >
              <div className="flex flex-col items-center justify-center w-12 h-12">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="relative z-10"
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary -z-0"
                    layoutId="activeNav"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
            </RouterNavLink>
          );
        })}
      </div>
    </motion.nav>
  );
}
