import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Calendar as CalendarIcon
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useCalendar } from "@/hooks/useCalendar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EventForm } from "@/components/forms/EventForm";
import { format, addMonths, subMonths, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);

  const { getEvents, addEvent, calendars } = useCalendar();

  // Calendar Computation
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const firstDayOfWeek = startOfMonth(currentDate).getDay();
  const paddingDays = Array.from({ length: firstDayOfWeek }, () => null);

  // Fetch events for selected day
  const selectedEvents = useMemo(() => {
    return getEvents(selectedDay);
  }, [selectedDay, getEvents]);

  // Check events for the whole month to show dots
  const eventsMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    daysInMonth.forEach(day => {
      const evts = getEvents(day);
      if (evts.length > 0) {
        map[day.getDate()] = true;
      }
    });
    return map;
  }, [daysInMonth, getEvents]);


  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleCreateEvent = (data: any) => {
    addEvent({
      ...data,
      date: selectedDay,
      calendarId: data.calendarId || 'personal'
    });
    setIsEventSheetOpen(false);
  };

  return (
    <div className="page-container pb-24">
      {/* Header */}
      <motion.header
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-regular mb-1">Calendário</h1>
        <p className="text-sm text-muted-foreground font-light">
          Organize seus compromissos
        </p>
      </motion.header>

      {/* View Toggle */}
      <motion.div
        className="flex gap-2 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <button
          className={`chip ${view === "month" ? "active" : ""}`}
          onClick={() => setView("month")}
        >
          Mensal
        </button>
        <button
          className={`chip ${view === "week" ? "active" : ""}`}
          onClick={() => setView("week")}
        >
          Semanal
        </button>
      </motion.div>

      {/* Calendar Widget */}
      <motion.div
        className="widget-card mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={handlePrevMonth}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <h2 className="text-lg font-regular capitalize">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <motion.button
            onClick={handleNextMonth}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* View Content */}
        {view === 'month' ? (
          <>
            {/* Week Days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs text-muted-foreground font-light py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {paddingDays.map((_, index) => (
                <div key={`pad-${index}`} className="aspect-square" />
              ))}
              {daysInMonth.map((day) => {
                const dayNum = day.getDate();
                const hasEvents = eventsMap[dayNum];
                const isSelected = isSameDay(day, selectedDay);
                const isToday = isSameDay(day, new Date());

                return (
                  <motion.button
                    key={day.toISOString()}
                    onClick={() => {
                      setSelectedDay(day);
                      // Update current date month if clicked day is visible but logic requires?
                      // With this logic, only days of current month are shown.
                    }}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${isSelected
                      ? "bg-primary text-primary-foreground"
                      : isToday
                        ? "border-2 border-primary"
                        : "hover:bg-muted"
                      }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className={`text-sm ${isSelected ? "font-regular" : "font-light"}`}>
                      {dayNum}
                    </span>
                    {hasEvents && !isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            Visualização semanal em breve
          </div>
        )}

      </motion.div>

      {/* Events List for Selected Day */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-regular capitalize">
            {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
          </h2>
          <motion.button
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsEventSheetOpen(true)}
          >
            <Plus className="w-5 h-5 text-primary-foreground" />
          </motion.button>
        </div>

        {selectedEvents.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title="Agenda livre"
            description="Nenhum compromisso para este dia."
          />
        ) : (
          <div className="space-y-3">
            {selectedEvents.map((event, index) => (
              <motion.div
                key={event.id}
                className="widget-card flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className="w-1 h-full min-h-[60px] rounded-full"
                  style={{ backgroundColor: event.color }}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-regular mb-1">{event.title}</h3>
                    {event.type === 'habit' && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">Hábito</span>}
                  </div>

                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span className="font-light">{event.startTime} - {event.endTime}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span className="font-light">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <Sheet open={isEventSheetOpen} onOpenChange={setIsEventSheetOpen}>
        <SheetContent side="bottom" className="h-[auto] max-h-[90vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader className="mb-4"><SheetTitle>Novo Evento</SheetTitle></SheetHeader>
          <EventForm
            defaultDate={selectedDay}
            calendars={calendars}
            onSubmit={handleCreateEvent}
            onCancel={() => setIsEventSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CalendarPage;
