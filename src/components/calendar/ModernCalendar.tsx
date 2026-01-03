import { useState } from "react";
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
import { ChevronLeft, ChevronRight, Zap, Trophy, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CalendarEvent } from "@/hooks/useCalendarData";

interface ModernCalendarProps {
    events: CalendarEvent[];
}

export function ModernCalendar({ events = [] }: ModernCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Navegação
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => setCurrentMonth(new Date());

    // Geração da Grade
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks = [];
    let week = [];

    // Agrupar dias em semanas para a grid
    calendarDays.forEach((day) => {
        week.push(day);
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    });

    // Filtrar eventos do dia selecionado (para Mobile/Dialog)
    const selectedDayEvents = selectedDate
        ? events.filter(e => isSameDay(e.start, selectedDate))
        : [];

    return (
        <div className="flex flex-col h-full bg-card/50 backdrop-blur-xl rounded-3xl border border-lime-500/10 shadow-2xl overflow-hidden">

            {/* HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-lime-500/10">
                <div className="flex items-center gap-4">
                    <div className="bg-lime-400/10 p-2 rounded-xl">
                        <span className="text-xl font-bold text-lime-500 tracking-tight">2026</span>
                    </div>
                    <h2 className="text-2xl font-light text-foreground capitalize">
                        {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                    </h2>
                </div>

                <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-xl">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-background/50 text-muted-foreground hover:text-lime-500 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs font-medium px-4 hover:bg-background/50 hover:text-lime-500 transition-colors">
                        Hoje
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-background/50 text-muted-foreground hover:text-lime-500 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* GRID DO CALENDÁRIO */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
                {/* Dias da Semana */}
                <div className="grid grid-cols-7 mb-2">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Células */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-2 h-full min-h-0">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {calendarDays.map((day, idx) => {
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const isTodayDate = isToday(day);

                            // Eventos do dia
                            const dayEvents = events.filter(e => isSameDay(e.start, day));

                            // Ordenar: Hábitos primeiro, depois eventos
                            const sortedEvents = dayEvents.sort((a, b) => {
                                if (a.type === 'habit' && b.type !== 'habit') return -1;
                                if (a.type !== 'habit' && b.type === 'habit') return 1;
                                return 0;
                            });

                            return (
                                <motion.div
                                    key={day.toISOString()}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2, delay: idx * 0.005 }}
                                    onClick={() => setSelectedDate(day)}
                                    className={cn(
                                        "relative flex flex-col rounded-2xl p-2 transition-all cursor-pointer group border border-transparent",
                                        !isCurrentMonth && "opacity-30 grayscale",
                                        isTodayDate && "bg-lime-500/5 ring-1 ring-lime-500/30",
                                        isSelected && "bg-secondary ring-2 ring-lime-500 shadow-lg z-10",
                                        !isSelected && !isTodayDate && "hover:bg-secondary/40 hover:border-white/5"
                                    )}
                                >
                                    {/* Número do Dia */}
                                    <span className={cn(
                                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                                        isTodayDate ? "bg-lime-500 text-black font-bold shadow-[0_0_10px_rgba(132,204,22,0.4)]" : "text-muted-foreground group-hover:text-foreground",
                                    )}>
                                        {format(day, "d")}
                                    </span>

                                    {/* Conteúdo Desktop (Chips) */}
                                    <div className="hidden md:flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                                        {sortedEvents.slice(0, 4).map(event => (
                                            <div
                                                key={event.id}
                                                className={cn(
                                                    "text-[10px] px-2 py-1 rounded-md truncate font-medium flex items-center gap-1.5 transition-all hover:scale-102",
                                                    event.type === 'habit' ? "bg-lime-500/10 text-lime-500 border border-lime-500/20" :
                                                        "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-1 h-1 rounded-full shrink-0",
                                                    event.type === 'habit' ? "bg-lime-500" : "bg-indigo-400"
                                                )} />
                                                {event.title}
                                            </div>
                                        ))}
                                        {sortedEvents.length > 4 && (
                                            <span className="text-[9px] text-muted-foreground pl-1">
                                                +{sortedEvents.length - 4} mais
                                            </span>
                                        )}
                                    </div>

                                    {/* Conteúdo Mobile (Dots) */}
                                    <div className="md:hidden flex gap-1 justify-center mt-1 flex-wrap content-start">
                                        {sortedEvents.slice(0, 5).map(event => (
                                            <div
                                                key={event.id}
                                                className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    event.type === 'habit' ? "bg-lime-500" : "bg-indigo-400"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* DRAWER / DETAILS DIALOG (Mobile & Desktop Click) */}
            <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
                <DialogContent className="sm:max-w-md border-lime-500/20">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <span className="text-lime-500 font-mono text-3xl font-bold">
                                {selectedDate && format(selectedDate, "dd")}
                            </span>
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground font-normal uppercase tracking-widest">
                                    {selectedDate && format(selectedDate, "MMMM", { locale: ptBR })}
                                </span>
                                <span className="text-base">
                                    {selectedDate && format(selectedDate, "EEEE", { locale: ptBR })}
                                </span>
                            </div>
                        </DialogTitle>
                        <DialogDescription>
                            Agenda Detalhada
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                        {selectedDayEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/50 border-2 border-dashed border-border/50 rounded-2xl">
                                <Trophy className="w-8 h-8 mb-2 opacity-20" />
                                <p>Dia Livre</p>
                            </div>
                        ) : (
                            selectedDayEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className={cn(
                                        "flex items-start gap-3 p-3 rounded-xl border backdrop-blur-sm transition-all hover:bg-white/5",
                                        event.type === 'habit' ? "bg-lime-500/5 border-lime-500/10" : "bg-indigo-500/5 border-indigo-500/10"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2 rounded-lg mt-0.5",
                                        event.type === 'habit' ? "bg-lime-500/20 text-lime-500" : "bg-indigo-500/20 text-indigo-400"
                                    )}>
                                        {event.type === 'habit' ? <Zap className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <h4 className={cn(
                                            "font-medium leading-none mb-1.5",
                                            event.type === 'habit' ? "text-lime-50 text-shadow-sm" : "text-foreground"
                                        )}>
                                            {event.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            {!event.allDay && (
                                                <span className="flex items-center gap-1">
                                                    {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
                                                </span>
                                            )}
                                            {event.allDay && <span className="uppercase text-[10px] font-bold tracking-wider opacity-70">Dia Inteiro</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
