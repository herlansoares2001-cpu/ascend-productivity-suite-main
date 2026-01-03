import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue?: string;
  color?: "default" | "lime" | "green" | "orange" | "blue";
  to?: string;
}

const colorClasses = {
  default: "bg-card",
  lime: "bg-primary/10",
  green: "bg-secondary/10",
  orange: "bg-orange-500/10",
  blue: "bg-blue-500/10",
};

const iconColorClasses = {
  default: "text-muted-foreground",
  lime: "text-primary",
  green: "text-secondary",
  orange: "text-orange-400",
  blue: "text-blue-400",
};

export function KPICard({ icon: Icon, label, value, subValue, color = "default", to }: KPICardProps) {
  const content = (
    <motion.div
      className={`rounded-2xl p-4 ${colorClasses[color]} border border-border/50 cursor-pointer`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className={`w-8 h-8 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className={`w-4 h-4 ${iconColorClasses[color]}`} />
      </div>
      <p className="text-xs text-muted-foreground font-light mb-1">{label}</p>
      <p className="text-lg font-regular leading-tight">{value}</p>
      {subValue && (
        <p className="text-xs text-muted-foreground font-thin mt-1">{subValue}</p>
      )}
    </motion.div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return content;
}
