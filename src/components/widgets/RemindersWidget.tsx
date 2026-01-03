import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus, X, Loader2 } from "lucide-react";
import { useReminders, Priority } from "@/hooks/useReminders";

const priorityColors: Record<Priority, string> = {
  low: "bg-blue-500/20 border-blue-500/30 text-blue-400",
  medium: "bg-orange-500/20 border-orange-500/30 text-orange-400",
  high: "bg-red-500/20 border-red-500/30 text-red-400",
};

const priorityDots: Record<Priority, string> = {
  low: "bg-blue-400",
  medium: "bg-orange-400",
  high: "bg-red-400",
};

export function RemindersWidget() {
  const { reminders, createReminder, deleteReminder, isLoading } = useReminders();
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");

  const handleAddReminder = () => {
    if (newText.trim()) {
      createReminder.mutate({ text: newText.trim(), priority: newPriority });
      setNewText("");
      setShowAdd(false);
    }
  };

  return (
    <motion.div
      className="widget-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-light text-muted-foreground">Lembretes</h3>
        </div>
        <motion.button
          onClick={() => setShowAdd(!showAdd)}
          className="w-7 h-7 rounded-lg bg-card/50 flex items-center justify-center text-muted-foreground hover:text-foreground"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Add Reminder Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="mb-3 space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddReminder()}
              placeholder="Novo lembrete..."
              className="w-full bg-card/50 border border-border/50 rounded-xl px-3 py-2 text-sm font-light placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
              autoFocus
            />
            <div className="flex gap-2">
              {(["low", "medium", "high"] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setNewPriority(p)}
                  className={`flex-1 px-2 py-1 rounded-lg text-xs font-light border transition-all ${
                    newPriority === p 
                      ? priorityColors[p] 
                      : 'bg-card/30 border-border/30 text-muted-foreground'
                  }`}
                >
                  {p === "low" ? "Baixa" : p === "medium" ? "Média" : "Alta"}
                </button>
              ))}
            </div>
            <motion.button
              onClick={handleAddReminder}
              disabled={createReminder.isPending}
              className="w-full py-2 rounded-xl bg-primary/10 text-primary text-sm font-light disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {createReminder.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Adicionar"
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminders List */}
      <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <AnimatePresence>
            {reminders.length > 0 ? (
              reminders.map((reminder) => (
                <motion.div
                  key={reminder.id}
                  className={`flex items-start gap-2 p-2 rounded-xl border ${priorityColors[reminder.priority as Priority]}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, height: 0 }}
                  layout
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${priorityDots[reminder.priority as Priority]}`} />
                  <span className="flex-1 text-sm font-light leading-tight">{reminder.text}</span>
                  <motion.button
                    onClick={() => deleteReminder.mutate(reminder.id)}
                    className="opacity-50 hover:opacity-100"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground font-light text-center py-3">
                Nenhum lembrete
              </p>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
