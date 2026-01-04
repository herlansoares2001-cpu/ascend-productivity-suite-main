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
    addWeeks,
    subWeeks,
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
    viewMode: 'month' | 'week';
}

export function ModernCalendar({ events = [], date, onDateChange, viewMode = 'month' }: ModernCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Sincroniza visual com seleção externa (opcional)
    useEffect(() => {
        if (!isSameMonth(currentDate, date) && viewMode === 'month') {
            setCurrentDate(date);
        }
    }, [date]);

    // Update currentDate when viewMode changes to ensure we are looking at the selected date
    useEffect(() => {
        setCurrentDate(date);
    }, [viewMode]);

    const next = () => {
        if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
        else setCurrentDate(addWeeks(currentDate, 1));
    };

    const prev = () => {
        if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
        else setCurrentDate(subWeeks(currentDate, 1));
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        onDateChange(today);
    };

    let calendarDays;
    if (viewMode === 'month') {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    } else {
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        calendarDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    }

    const isCurrentContext = (day: Date) => {
        if (viewMode === 'month') return isSameMonth(day, currentDate);
        return true;
    };

    return (
        <div className="flex flex-col bg-card/40 backdrop-blur-xl rounded-3xl border border-[#D4F657]/10 shadow-sm overflow-hidden select-none transition-all">

            {/* HEADER: Navegação (Sem controles extras) */}
            <div className="flex items-center justify-between p-4 border-b border-[#D4F657]/10">
                <Button variant="ghost" size="icon" onClick={prev} className="h-8 w-8 hover:bg-[#D4F657]/20 text-muted-foreground hover:text-[#D4F657] rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Button>

                <span className="text-lg font-bold capitalize min-w-[140px] text-center text-foreground cursor-pointer hover:text-[#D4F657] transition-colors" onClick={goToToday}>
                    {viewMode === 'month'
                        ? format(currentDate, "MMMM yyyy", { locale: ptBR })
                        : `Semana ${format(currentDate, "w")}`
                    }
                </span>

                <Button variant="ghost" size="icon" onClick={next} className="h-8 w-8 hover:bg-[#D4F657]/20 text-muted-foreground hover:text-[#D4F657] rounded-full transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>

            {/* GRID DO CALENDÁRIO */}
            <div className="p-3">
                {/* Dias da Semana */}
                <div className="grid grid-cols-7 mb-2">
                    {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
                        <div key={`${day}-${i}`} className="text-center text-[10px] font-extrabold text-[#D4F657]/50 uppercase tracking-widest">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Células */}
                <div className={cn(
                    "grid grid-cols-7 gap-1",
                    viewMode === 'month' ? "grid-rows-5" : "grid-rows-1"
                )}>
                    <AnimatePresence mode="popLayout" initial={false}>
                        {calendarDays.map((day) => {
                            const isSelected = isSameDay(day, date);
                            const isTodayDate = isToday(day);
                            const inContext = isCurrentContext(day);

                            // Eventos do dia
                            const dayEvents = events.filter(e => isSameDay(e.start, day));
                            const hasFinance = dayEvents.some(e => e.type === 'finance');
                            const hasHabit = dayEvents.some(e => e.type === 'habit');
                            const hasAppt = dayEvents.some(e => e.type === 'event' || e.type === 'task');

                            return (
                                <motion.div
                                    key={day.toISOString()}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => onDateChange(day)}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center py-2 rounded-xl transition-all cursor-pointer aspect-square",
                                        !inContext && "opacity-20",
                                        isSelected && "bg-[#D4F657] text-black shadow-[0_0_20px_rgba(212,246,87,0.5)] z-10 scale-105 font-bold",
                                        !isSelected && isTodayDate && "text-[#D4F657] ring-1 ring-[#D4F657] bg-[#D4F657]/5",
                                        !isSelected && !isTodayDate && "hover:bg-white/5 text-muted-foreground"
                                    )}
                                >
                                    <span className="text-sm">
                                        {format(day, "d")}
                                    </span>

                                    {/* INDICADORES (Dots - Always Show All) */}
                                    <div className="flex gap-1 mt-1 absolute bottom-1.5">
                                        {hasFinance && (
                                            <div className={cn(
                                                "w-1 h-1 rounded-full",
                                                isSelected ? "bg-black" : "bg-red-500"
                                            )} title="Financeiro" />
                                        )}
                                        {hasHabit && (
                                            <div className={cn(
                                                "w-1 h-1 rounded-full",
                                                isSelected ? "bg-black/70" : "bg-[#D4F657]"
                                            )} title="Hábito" />
                                        )}
                                        {hasAppt && (
                                            <div className={cn(
                                                "w-1 h-1 rounded-full",
                                                isSelected ? "bg-black/50" : "bg-sky-400"
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
