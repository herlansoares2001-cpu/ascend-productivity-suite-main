import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  MapPin
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

interface Event {
  id: string;
  title: string;
  time: string;
  location?: string;
  color: string;
}

interface DayEvents {
  [key: string]: Event[];
}

const mockEvents: DayEvents = {
  "15": [
    { id: "1", title: "Reunião de Planejamento", time: "09:00", location: "Escritório", color: "#EBFF57" },
    { id: "2", title: "Almoço com cliente", time: "12:30", location: "Restaurante", color: "#A2F7A1" },
  ],
  "16": [
    { id: "3", title: "Dentista", time: "14:00", color: "#FF6B6B" },
  ],
  "18": [
    { id: "4", title: "Treino Personal", time: "07:00", location: "Academia", color: "#A2F7A1" },
    { id: "5", title: "Call com equipe", time: "15:00", color: "#EBFF57" },
  ],
  "20": [
    { id: "6", title: "Aniversário Maria", time: "19:00", location: "Casa dela", color: "#9B59B6" },
  ],
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(18);
  const [view, setView] = useState<"month" | "week">("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDay }, (_, i) => null);

  const selectedEvents = mockEvents[selectedDay.toString()] || [];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="page-container">
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

      {/* Calendar */}
      <motion.div 
        className="widget-card mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <motion.button 
            onClick={prevMonth}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <h2 className="text-lg font-regular">
            {months[month]} {year}
          </h2>
          <motion.button 
            onClick={nextMonth}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

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
          {days.map((day) => {
            const hasEvents = mockEvents[day.toString()];
            const isSelected = day === selectedDay;
            const isToday = day === 18; // Mock today

            return (
              <motion.button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
                  isSelected 
                    ? "bg-primary text-primary-foreground" 
                    : isToday 
                    ? "border-2 border-primary" 
                    : "hover:bg-muted"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <span className={`text-sm ${isSelected ? "font-regular" : "font-light"}`}>
                  {day}
                </span>
                {hasEvents && !isSelected && (
                  <div className="flex gap-0.5 mt-1">
                    {hasEvents.slice(0, 3).map((event, i) => (
                      <div 
                        key={i} 
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Events for Selected Day */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-regular">
            {selectedDay} de {months[month]}
          </h2>
          <motion.button 
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="w-5 h-5 text-primary-foreground" />
          </motion.button>
        </div>

        {selectedEvents.length === 0 ? (
          <EmptyState 
            icon={Plus}
            title="Nenhum evento"
            description="Adicione compromissos para este dia."
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
                  <h3 className="font-regular mb-2">{event.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-light">{event.time}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
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
    </div>
  );
};

export default CalendarPage;
