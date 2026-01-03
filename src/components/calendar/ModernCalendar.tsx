import { useState, useEffect } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "@/hooks/useCalendarData";

interface ModernCalendarProps {
    events: CalendarEvent[];
    date: Date;
    onDateChange: (date: Date) => void;
    filter?: 'all' | 'finance' | 'habit' | 'event';
}

export function ModernCalendar({ events = [], date, onDateChange, filter = 'all' }: ModernCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Sincroniza mês visual com a data selecionada se ela mudar drasticamente (opcional, mas bom pra UX)
    useEffect(() => {
        if (!isSameMonth(currentMonth, date)) {
            setCurrentMonth(date);
        }
    }, [date]);

    // Navegação
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        onDateChange(today);
    };

    // Geração da Grade
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
        <div className="flex flex-col h-full bg-card/30 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl border-b sm:border border-lime-500/10 shadow-sm overflow-hidden select-none">

            {/* HEADER COMPACTO */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-lime-500/10">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-lime-500/20 text-muted-foreground hover:text-lime-500 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <span className="text-lg font-medium capitalize min-w-[140px] text-center">
                        {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                    </span>
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-lime-500/20 text-muted-foreground hover:text-lime-500 rounded-full transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>

                <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs font-bold uppercase tracking-wider text-lime-500 hover:bg-lime-500/10">
                    Hoje
                </Button>
            </div>

            {/* GRID DO CALENDÁRIO */}
            <div className="flex-1 flex flex-col p-2 sm:p-4">
                {/* Dias da Semana - CORRIGIDO KEY DUPLICADA */}
                <div className="grid grid-cols-7 mb-2">
                    {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
                        <div key={`${day}-${i}`} className="text-center text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Células */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-1 sm:gap-2">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {calendarDays.map((day, idx) => {
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isSelected = isSameDay(day, date);
                            const isTodayDate = isToday(day);

                            // Eventos do dia (Filtrados visualmente)
                            const dayEvents = events.filter(e => isSameDay(e.start, day));
                            const hasFinance = dayEvents.some(e => e.type === 'finance');
                            const hasHabit = dayEvents.some(e => e.type === 'habit');
                            const hasAppt = dayEvents.some(e => e.type === 'event' || e.type === 'task');

                            // Lógica de Filtro Visual
                            const showFinance = (filter === 'all' || filter === 'finance') && hasFinance;
                            const showHabit = (filter === 'all' || filter === 'habit') && hasHabit;
                            const showAppt = (filter === 'all' || filter === 'event') && hasAppt;

                            return (
                                <motion.div
                                    key={day.toISOString()}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => onDateChange(day)}
                                    className={cn(
                                        "relative flex flex-col items-center justify-start py-1 sm:py-2 rounded-xl transition-all cursor-pointer aspect-[1/1] sm:aspect-auto",
                                        !isCurrentMonth && "opacity-20",
                                        isSelected && "bg-lime-500 text-black shadow-[0_0_15px_rgba(132,204,22,0.6)] z-10 scale-105",
                                        !isSelected && isTodayDate && "bg-lime-500/10 text-lime-500 border border-lime-500/30",
                                        !isSelected && !isTodayDate && "hover:bg-secondary/60 text-muted-foreground"
                                    )}
                                >
                                    <span className={cn(
                                        "text-sm sm:text-base font-medium lufga-font",
                                        isSelected && "font-bold"
                                    )}>
                                        {format(day, "d")}
                                    </span>

                                    {/* INDICADORES (Dots) */}
                                    <div className="flex gap-0.5 mt-1 sm:mt-2">
                                        {showFinance && (
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                isSelected ? "bg-black" : "bg-red-500"
                                            )} title="Financeiro" />
                                        )}
                                        {showHabit && (
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                isSelected ? "bg-black/70" : "bg-lime-500"
                                            )} title="Hábito" />
                                        )}
                                        {showAppt && (
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                isSelected ? "bg-black/50" : "bg-sky-500"
                                            )} title="Evento" />
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
