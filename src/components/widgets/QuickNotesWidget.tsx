import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StickyNote, Save, Loader2 } from "lucide-react";
import { useNotes } from "@/hooks/useNotes";

export function QuickNotesWidget() {
  const { quickNote, updateQuickNote, isLoading } = useNotes();
  const [localNote, setLocalNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (quickNote) {
      setLocalNote(quickNote.content);
    }
  }, [quickNote]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalNote(value);
    setIsSaving(true);
    updateQuickNote(value);
    
    // Show saving indicator briefly
    setTimeout(() => setIsSaving(false), 1500);
  };

  if (isLoading) {
    return (
      <motion.div
        className="widget-card flex items-center justify-center py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="widget-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-light text-muted-foreground">Anotação Rápida</h3>
        </div>
        <motion.div
          className="flex items-center gap-1 text-xs font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Salvando...</span>
            </>
          ) : (
            <>
              <Save className="w-3 h-3 text-secondary" />
              <span className="text-secondary">Salvo</span>
            </>
          )}
        </motion.div>
      </div>

      <textarea
        value={localNote}
        onChange={handleChange}
        placeholder="Escreva sua anotação aqui..."
        className="w-full h-24 bg-card/30 border border-border/30 rounded-xl p-3 text-sm font-light placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 resize-none scrollbar-hide"
      />
    </motion.div>
  );
}
