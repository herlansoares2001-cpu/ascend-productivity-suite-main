import { useState } from "react";
import { useCalendarData } from "@/hooks/useCalendarData";
import { ModernCalendar } from "@/components/calendar/ModernCalendar";
import { DayAgendaView } from "@/components/calendar/DayAgendaView";
import { Loader2, Plus, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { isSameDay } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function CalendarPage() {
  const { data: events = [], isLoading } = useCalendarData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<'all' | 'finance' | 'habit' | 'event'>('all');

  const selectedDayEvents = events.filter(e => isSameDay(e.start, selectedDate));

  return (
    <div className="page-container h-full max-h-screen flex flex-col relative overflow-hidden bg-background">

      {/* TOP SECTION: Calendar & Filters */}
      <div className="flex-none flex flex-col z-10 bg-background/80 backdrop-blur-md pb-4 border-b border-border/50">
        {/* Filter Pills */}
        <div className="flex justify-center py-2">
          <ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as any)} className="bg-secondary/50 p-1 rounded-full border border-border/50">
            <ToggleGroupItem value="all" className="rounded-full px-4 text-xs data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all">
              Tudo
            </ToggleGroupItem>
            <ToggleGroupItem value="finance" className="rounded-full px-4 text-xs data-[state=on]:bg-red-500/10 data-[state=on]:text-red-500 transition-all">
              Finanças
            </ToggleGroupItem>
            <ToggleGroupItem value="habit" className="rounded-full px-4 text-xs data-[state=on]:bg-lime-500/10 data-[state=on]:text-lime-500 transition-all">
              Hábitos
            </ToggleGroupItem>
            <ToggleGroupItem value="event" className="rounded-full px-4 text-xs data-[state=on]:bg-sky-500/10 data-[state=on]:text-sky-500 transition-all">
              Eventos
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Calendar Heatmap */}
        <div className="px-2 sm:px-6">
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
            </div>
          ) : (
            <ModernCalendar
              events={events}
              date={selectedDate}
              onDateChange={setSelectedDate}
              filter={filter}
            />
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: Day Agenda (Dashboard) */}
      <div className="flex-1 overflow-hidden relative bg-card/10">
        <DayAgendaView date={selectedDate} events={selectedDayEvents} />
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 h-14 w-14 bg-lime-500 text-black font-bold rounded-full shadow-[0_0_20px_rgba(132,204,22,0.4)] flex items-center justify-center z-50 hover:bg-lime-400 transition-colors"
        onClick={() => {/* Open Universal Create Modal */ }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
