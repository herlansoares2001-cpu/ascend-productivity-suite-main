import { motion } from "framer-motion";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface Appointment {
  id: string;
  title: string;
  time: string;
  location?: string;
}

interface WeeklyCalendarProps {
  appointments: Appointment[];
}

export function WeeklyCalendar({ appointments }: WeeklyCalendarProps) {
  const today = new Date();
  const currentDayOfWeek = today.getDay();

  // Generate week days starting from Sunday
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - currentDayOfWeek + i);
    return {
      dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3),
      dayNumber: date.getDate(),
      isToday: i === currentDayOfWeek,
      date: date,
    };
  });

  return (
    <motion.div
      className="widget-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-light text-muted-foreground">Semana à Vista</h3>
        </div>
        <Link to="/more" className="text-xs text-primary font-light hover:underline">
          Ver tudo
        </Link>
      </div>

      {/* Week Days Strip */}
      <div className="flex justify-between gap-1 mb-5">
        {weekDays.map((day, index) => (
          <motion.div
            key={index}
            className={`flex flex-col items-center py-2 px-2 rounded-xl flex-1 transition-all ${day.isToday
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-muted'
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={`text-[10px] font-light uppercase ${day.isToday ? '' : 'text-muted-foreground'}`}>
              {day.dayName}
            </span>
            <span className={`text-sm font-regular mt-0.5 ${day.isToday ? '' : ''}`}>
              {day.dayNumber}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-light mb-2">Próximos compromissos</p>
        {appointments.length > 0 ? (
          appointments.slice(0, 3).map((apt, index) => (
            <motion.div
              key={apt.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="w-1 h-10 rounded-full bg-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-regular truncate">{apt.title}</p>
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
          <p className="text-sm text-muted-foreground font-light text-center py-4">
            Nenhum compromisso agendado
          </p>
        )}
      </div>
    </motion.div>
  );
}
