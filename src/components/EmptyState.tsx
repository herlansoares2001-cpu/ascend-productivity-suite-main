import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div 
      className="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-regular mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground font-light max-w-[240px]">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
