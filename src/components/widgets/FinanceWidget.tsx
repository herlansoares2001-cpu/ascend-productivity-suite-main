import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

interface FinanceWidgetProps {
  todaySpent: number;
  dailyBudget: number;
  currency?: string;
}

export function FinanceWidget({ todaySpent, dailyBudget, currency = "R$" }: FinanceWidgetProps) {
  const remaining = dailyBudget - todaySpent;
  const percentage = Math.min((todaySpent / dailyBudget) * 100, 100);
  const isOverBudget = todaySpent > dailyBudget;

  return (
    <motion.div 
      className="widget-card"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-light text-muted-foreground">Gasto Hoje</span>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <span className="text-3xl font-regular">
            {currency} {todaySpent.toFixed(2)}
          </span>
        </div>
        <div className={`flex items-center gap-1 text-sm ${isOverBudget ? 'text-destructive' : 'text-secondary'}`}>
          {isOverBudget ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="font-light">
            {currency} {Math.abs(remaining).toFixed(2)} {isOverBudget ? 'acima' : 'restante'}
          </span>
        </div>
      </div>

      <div className="progress-bar">
        <motion.div 
          className={`h-full rounded-full ${isOverBudget ? 'bg-destructive' : ''}`}
          style={{ 
            background: isOverBudget 
              ? 'hsl(var(--destructive))' 
              : 'var(--gradient-lime)' 
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <p className="text-xs text-muted-foreground font-light mt-2">
        Orçamento diário: {currency} {dailyBudget.toFixed(2)}
      </p>
    </motion.div>
  );
}
