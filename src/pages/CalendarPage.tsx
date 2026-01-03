import { useCalendarData } from "@/hooks/useCalendarData";
import { ModernCalendar } from "@/components/calendar/ModernCalendar";
import { Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function CalendarPage() {
  const { data: events = [], isLoading } = useCalendarData();

  return (
    <div className="page-container h-[calc(100vh-100px)] flex flex-col relative">

      {/* Calendar Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 overflow-hidden"
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-lime-500" />
          </div>
        ) : (
          <ModernCalendar events={events} />
        )}
      </motion.div>

      {/* Float Action Button (Placeholder for creating events - Futuro: Abrir modal de criação) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 h-14 w-14 bg-lime-500 text-black font-bold rounded-full shadow-[0_0_20px_rgba(132,204,22,0.4)] flex items-center justify-center z-50 hover:bg-lime-400 transition-colors"
        onClick={() => {
          // Adicionar lógica de modal aqui futuramente
          console.log("Novo Evento");
        }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
