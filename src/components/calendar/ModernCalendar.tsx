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
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "@/hooks/useCalendarData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ModernCalendarProps {
    events: CalendarEvent[];
    date: Date;
    onDateChange: (date: Date) => void;
    currentFilter: 'all' | 'habit' | 'event';
    onFilterChange: (filter: 'all' | 'habit' | 'event') => void;
}

export function ModernCalendar({ events = [], date, onDateChange, currentFilter, onFilterChange }: ModernCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

    // Sincroniza visual com seleção externa (opcional)
    useEffect(() => {
        if (!isSameMonth(currentDate, date) && viewMode === 'month') {
            setCurrentDate(date);
        }
    }, [date]);

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

            {/* HEADER: Navegação + Controles (Switch View + Filter Dropdown) */}
            <div className="flex flex-col gap-4 p-4 border-b border-[#D4F657]/10">

                {/* Linha 1: Mês e Navegação */}
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
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

                    {/* View Switcher (Pílulas Neon/Moss - Compacto) */}
                    <div
                        className="flex p-0.5 rounded-full border border-white/5 bg-[#2F3B2A]"
                    >
                        <button
                            onClick={() => setViewMode('month')}
                            className={cn(
                                "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all",
                                viewMode === 'month' ? "bg-[#D4F657] text-black shadow-lg" : "text-white/60 hover:text-white"
                            )}
                        >
                            Mês
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={cn(
                                "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all",
                                viewMode === 'week' ? "bg-[#D4F657] text-black shadow-lg" : "text-white/60 hover:text-white"
                            )}
                        >
                            Sem
                        </button>
                    </div>
                </div>

                {/* Linha 2: Dropdown de Filtro (Style Clean) */}
                <div className="flex justify-end">
                    <Select value={currentFilter} onValueChange={(v: any) => onFilterChange(v)}>
                        <SelectTrigger className="w-[180px] h-8 text-xs font-medium border-[#D4F657]/20 bg-[#2F3B2A]/50 focus:ring-[#D4F657] rounded-full text-white/90">
                            <div className="flex items-center gap-2">
                                <Filter className="w-3 h-3 text-[#D4F657]" />
                                <SelectValue placeholder="Filtrar..." />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1f16] border-[#D4F657]/20 text-white">
                            <SelectItem value="all" className="focus:bg-[#D4F657] focus:text-black">Mostrar Tudo</SelectItem>
                            <SelectItem value="habit" className="focus:bg-[#D4F657] focus:text-black">Apenas Hábitos</SelectItem>
                            <SelectItem value="event" className="focus:bg-[#D4F657] focus:text-black">Apenas Eventos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

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

                            // Visual Filter Logic for Dots
                            // Se o usuário selecionar "Hábitos", mostramos SÓ dots de hábitos ou mantemos tudo no grid e filtramos só a lista?
                            // Geralmente filtro dropdown afeta a vista. Vou filtrar os dots também.
                            const showFinance = (currentFilter === 'all') && hasFinance;
                            const showHabit = (currentFilter === 'all' || currentFilter === 'habit') && hasHabit;
                            const showAppt = (currentFilter === 'all' || currentFilter === 'event') && hasAppt;

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

                                    {/* INDICADORES (Dots - Filtered) */}
                                    <div className="flex gap-1 mt-1 absolute bottom-1.5">
                                        {showFinance && (
                                            <div className={cn(
                                                "w-1 h-1 rounded-full",
                                                isSelected ? "bg-black" : "bg-red-500"
                                            )} title="Financeiro" />
                                        )}
                                        {showHabit && (
                                            <div className={cn(
                                                "w-1 h-1 rounded-full",
                                                isSelected ? "bg-black/70" : "bg-[#D4F657]"
                                            )} title="Hábito" />
                                        )}
                                        {showAppt && (
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
