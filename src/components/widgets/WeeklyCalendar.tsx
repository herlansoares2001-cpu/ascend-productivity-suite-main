import { motion } from "framer-motion";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { isSameDay, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment {
  id: string;
  title: string;
  time: string;
  location?: string;
}

interface WeeklyCalendarProps {
  appointments: Appointment[];
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
}

export function WeeklyCalendar({ appointments, selectedDate = new Date(), onSelectDate }: WeeklyCalendarProps) {
  const today = new Date();
  const currentDayOfWeek = today.getDay();

  // Generate week days starting from Sunday
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - currentDayOfWeek + i);
    return {
      dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3),
      dayNumber: date.getDate(),
      isToday: isSameDay(date, today),
      isSelected: isSameDay(date, selectedDate),
      date: date,
    };
  });

  return (
    <motion.div
      className="widget-card h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-light text-muted-foreground">Semana à Vista</h3>
        </div>
        <Link to="/calendar" className="text-xs text-primary font-light hover:underline">
          Ver Calendário
        </Link>
      </div>

      {/* Week Days Strip */}
      <div className="flex justify-between gap-1 mb-5">
        {weekDays.map((day, index) => (
          <motion.div
            key={index}
            className={`flex flex-col items-center py-2 px-2 rounded-xl flex-1 transition-all cursor-pointer ${day.isSelected
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : day.isToday
                ? 'bg-secondary/20 text-secondary border border-secondary/30'
                : 'bg-card hover:bg-muted'
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectDate?.(day.date)}
          >
            <span className={`text-[10px] font-light uppercase ${day.isSelected || day.isToday ? '' : 'text-muted-foreground'}`}>
              {day.dayName}
            </span>
            <span className={`text-sm font-regular mt-0.5`}>
              {day.dayNumber}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-1">
        <p className="text-xs text-muted-foreground font-light mb-2">
          {isSameDay(selectedDate, today) ? "Compromissos de Hoje" : `Compromissos de ${format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}`}
        </p>
        {appointments.length > 0 ? (
          appointments.map((apt, index) => (
            <motion.div
              key={apt.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30 hover:border-primary/30 transition-colors cursor-pointer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="w-1 h-10 rounded-full bg-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-regular truncate text-foreground">{apt.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-light">
                    <Clock className="w-3 h-3" />
                    {apt.time}
                  </span>
                  {apt.location && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-light truncate">
                      <MapPin className="w-3 h-3" />
                      {apt.location}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-border/30 bg-muted/30 mt-4">
            <span className="text-sm text-muted-foreground">Sem agendamentos</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
