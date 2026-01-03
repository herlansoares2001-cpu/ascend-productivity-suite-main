import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CheckCircle2,
  Wallet,
  Calendar,
  BookOpen,
  Dumbbell,
  FileText,
  Target,
  Sparkles
} from "lucide-react";
import { AICopilot } from "@/components/AICopilot";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Home" },
  { path: "/finances", icon: Wallet, label: "Finanças" },
  { path: "AI_TRIGGER", icon: Sparkles, label: "IA" },
  { path: "/habits", icon: CheckCircle2, label: "Hábitos" },
  { path: "/calendar", icon: Calendar, label: "Agenda" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <motion.nav
      className="fixed bottom-6 z-50 glass rounded-full px-2 py-2 w-[90%] max-w-[380px] md:max-w-[480px]"
      style={{
        boxShadow: "0 8px 32px -4px hsl(0 0% 0% / 0.5), inset 0 1px 0 hsl(0 0% 100% / 0.1)",
        left: "50%",
        marginLeft: "0",
        marginRight: "0"
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
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg border-[6px] border-background"
                    style={{
                      boxShadow: "0 0 20px hsl(68 100% 67% / 0.6)"
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
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
              className={`nav-item flex-shrink-0 relative ${isActive ? "active" : "text-muted-foreground"}`}
            >
              <div className="flex flex-col items-center justify-center w-12 h-12">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="relative z-10"
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
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
