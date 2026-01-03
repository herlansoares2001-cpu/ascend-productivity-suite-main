import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  Filter,
  MapPin,
  MoreHorizontal
} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useCalendar, CalendarEvent } from "@/hooks/useCalendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EventForm } from "@/components/forms/EventForm";
import { Calendar as DayPicker } from "@/components/ui/calendar"; // Assuming standard Shadcn Calendar component

// --- Constants ---
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const CELL_HEIGHT = 60; // px per hour

type ViewType = "agenda" | "day" | "week" | "month";

export const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("week"); // Default to Week as requested often
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [clickedTime, setClickedTime] = useState<string | undefined>(undefined);

  const { getEvents, calendars, toggleCalendar, addEvent } = useCalendar();

  // Navigation
  const navigate = (direction: -1 | 1) => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() + direction);
    else if (view === 'week') newDate.setDate(newDate.getDate() + (direction * 7));
    else newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const handleCreateClick = (date: Date, timeStr?: string) => {
    // If click on grid, set clicked time
    setCurrentDate(date);
    setClickedTime(timeStr);
    setIsEventDialogOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    addEvent({ ...data, date: currentDate });
    setIsEventDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-background">
      {/* --- Header --- */}
      <header className="flex flex-col gap-4 p-4 border-b md:flex-row md:items-center md:justify-between bg-background z-40 relative">
        <div className="flex items-center justify-between w-full md:w-auto">
          <h2 className="text-xl font-semibold capitalize text-foreground">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>

          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 ml-4 shadow-sm border">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => navigate(-1)}><ChevronLeft className="w-4 h-4" /></Button>
            <Button size="sm" variant="ghost" className="h-8 px-3 text-xs font-medium" onClick={() => setCurrentDate(new Date())}>Hoje</Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => navigate(1)}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {/* Filters */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 shrink-0 h-8">
                <Filter className="w-3 h-3" /> <span className="hidden sm:inline">Filtros</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Calendários</h4>
                {calendars.map(cal => (
                  <div key={cal.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={cal.visible}
                      onCheckedChange={() => toggleCalendar(cal.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      style={{ borderColor: cal.color }}
                    />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cal.color }} />
                    <span className="text-sm">{cal.name}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* View Toggle */}
          <div className="flex bg-muted/50 rounded-lg p-1 shrink-0 border shadow-sm">
            {(['agenda', 'day', 'week', 'month'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-[10px] sm:text-xs font-medium rounded-md capitalize transition-all ${view === v ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {v === 'agenda' ? 'Lista' : v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>

          <Button size="sm" className="shrink-0 h-8 px-3" onClick={() => handleCreateClick(new Date())}>
            <Plus className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Novo</span>
          </Button>
        </div>
      </header>

      {/* --- Content Area --- */}
      <div className="flex-1 overflow-auto relative">
        {view === 'month' && <MonthView currentDate={currentDate} getEvents={getEvents} onDayClick={(d) => { setCurrentDate(d); setView('day'); }} />}
        {view === 'week' && <WeekView currentDate={currentDate} getEvents={getEvents} onCreateClick={handleCreateClick} />}
        {view === 'day' && <DayView currentDate={currentDate} getEvents={getEvents} onCreateClick={handleCreateClick} />}
        {view === 'agenda' && <AgendaView currentDate={currentDate} getEvents={getEvents} />}
      </div>

      {/* Create Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Evento</DialogTitle></DialogHeader>
          <EventForm
            defaultDate={currentDate}
            defaultStartTime={clickedTime}
            calendars={calendars}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsEventDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Sub-Components ---

const MonthView = ({ currentDate, getEvents, onDayClick }: { currentDate: Date, getEvents: any, onDayClick: (d: Date) => void }) => {
  const start = startOfWeek(startOfMonth(currentDate));
  const end = endOfWeek(endOfMonth(currentDate));
  const days = [];
  let day = start;
  while (day <= end) {
    days.push(day);
    day = addDays(day, 1);
  }
  // User requested shorter names for better mobile viz
  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div className="h-full flex flex-col p-4">
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((d, i) => <div key={i} className="text-center text-[10px] sm:text-xs text-muted-foreground font-bold">{d}</div>)}
      </div>
      <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-1">
        {days.map((d, i) => {
          const isToday = isSameDay(d, new Date());
          const isCurrentMonth = d.getMonth() === currentDate.getMonth();
          const events = getEvents(d);

          return (
            <div
              key={i}
              onClick={() => onDayClick(d)}
              className={`min-h-[60px] md:min-h-[80px] border rounded-lg p-1 hover:bg-muted/30 cursor-pointer transition-colors flex flex-col gap-1 ${!isCurrentMonth ? 'opacity-40 bg-muted/10' : ''} ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}
            >
              <span className={`text-xs ml-1 font-medium ${isToday ? 'text-primary' : ''}`}>{format(d, 'd')}</span>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {events.slice(0, 3).map((ev: any) => (
                  <div key={ev.id} className="text-[10px] px-1 rounded truncate flex items-center gap-1" style={{ backgroundColor: ev.color + '40', color: ev.color === '#EBFF57' ? 'black' : 'inherit' }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
                    <span className="truncate">{ev.title}</span>
                  </div>
                ))}
                {events.length > 3 && <span className="text-[10px] text-muted-foreground pl-1 hidden sm:block">+{events.length - 3}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Shared Logic for Grid (Week/Day)
const TimeGridEvent = ({ event, style }: { event: any, style?: React.CSSProperties }) => (
  <div
    className="absolute left-0 right-1 rounded px-2 py-1 text-xs border-l-4 overflow-hidden hover:z-10 hover:shadow-lg transition-all cursor-pointer group"
    style={{
      top: event.top,
      height: Math.max(event.height, 20),
      backgroundColor: event.color + '20',
      borderLeftColor: event.color,
      color: 'inherit',
      ...style
    }}
  >
    <div className="font-semibold text-xs leading-tight truncate">{event.title}</div>
    <div className="text-[10px] opacity-80 truncate hidden sm:block">{event.startTime} - {event.endTime}</div>
    <div className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize opacity-0 group-hover:opacity-100 hover:bg-black/20" />
  </div>
);

const CurrentTimeIndicator = () => {
  const [top, setTop] = useState(0);
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const mins = (now.getHours() * 60) + now.getMinutes();
      setTop(mins * (CELL_HEIGHT / 60));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none flex items-center"
      style={{ top }}
    >
      <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
    </div>
  );
};

const WeekView = ({ currentDate, getEvents, onCreateClick }: any) => {
  const start = startOfWeek(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to 8am
  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 8 * CELL_HEIGHT;
  }, []);

  return (
    <div className="flex flex-col h-full overflow-auto bg-background" ref={containerRef}>
      {/* Container with min-width ensures consistent layout on mobile (horizontal scroll) */}
      <div className="min-w-[600px] relative">
        {/* Header Days - STICKY inside the scroll container */}
        <div className="flex border-b pl-14 pr-2 py-2 bg-background sticky top-0 z-30 shadow-sm">
          {days.map((d, i) => {
            const isToday = isSameDay(d, new Date());
            return (
              <div key={i} className="flex-1 text-center">
                <div className={`text-[10px] uppercase font-bold mb-1 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                  {format(d, 'EEE', { locale: ptBR }).replace('.', '')}
                </div>
                <div className={`text-lg font-light ${isToday ? 'bg-primary text-primary-foreground w-8 h-8 rounded-full mx-auto flex items-center justify-center' : ''}`}>
                  {format(d, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <div className="flex h-[1440px] relative">
          <div className="w-14 flex-shrink-0 border-r bg-background sticky left-0 z-20">
            {HOURS.map(h => (
              <div key={h} className="h-[60px] text-xs text-muted-foreground text-right pr-2 relative -top-2 bg-background">
                {h}:00
              </div>
            ))}
          </div>

          <div className="flex-1 flex relative">
            {HOURS.map(h => (
              <div key={`line-${h}`} className="absolute w-full border-b border-border/40 pointer-events-none" style={{ top: h * CELL_HEIGHT }} />
            ))}

            <CurrentTimeIndicator />

            {days.map((d, dayIdx) => {
              const events = getEvents(d);
              const renderedEvents = events.map((ev: any) => {
                const [sh, sm] = ev.startTime.split(':').map(Number);
                const [eh, em] = ev.endTime.split(':').map(Number);
                const startMins = sh * 60 + sm;
                const endMins = eh * 60 + em;
                const duration = endMins - startMins;
                return {
                  ...ev,
                  top: (startMins / 60) * CELL_HEIGHT,
                  height: (duration / 60) * CELL_HEIGHT
                };
              });

              renderedEvents.sort((a: any, b: any) => a.top - b.top);
              const styledEvents = renderedEvents.map((ev: any, i: number) => {
                const prev = renderedEvents[i - 1];
                let width = "100%";
                let left = "0%";
                if (prev && ev.top < (prev.top + prev.height)) {
                  width = "50%";
                  left = "50%";
                }
                return { ...ev, style: { width, left } };
              });

              return (
                <div
                  key={dayIdx}
                  className="flex-1 border-r relative group"
                >
                  {HOURS.map(h => (
                    <div
                      key={`slot-${h}`}
                      className="absolute w-full h-[60px] hover:bg-muted/10 group-hover:block"
                      style={{ top: h * CELL_HEIGHT }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateClick(d, `${h.toString().padStart(2, '0')}:00`);
                      }}
                    />
                  ))}
                  {styledEvents.map((ev: any) => (
                    <TimeGridEvent key={ev.id} event={ev} style={ev.style} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const DayView = ({ currentDate, getEvents, onCreateClick }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 8 * CELL_HEIGHT;
  }, []);

  const events = getEvents(currentDate);
  const renderedEvents = events.map((ev: any) => {
    const [sh, sm] = ev.startTime.split(':').map(Number);
    const [eh, em] = ev.endTime.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    return {
      ...ev,
      top: (startMins / 60) * CELL_HEIGHT,
      height: ((endMins - startMins) / 60) * CELL_HEIGHT
    };
  });

  return (
    <div className="flex flex-col h-full relative">
      <div className="text-center py-2 border-b">
        <h2 className="text-xl sm:text-2xl font-light">{format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</h2>
      </div>
      <div className="flex-1 overflow-y-auto relative" ref={containerRef}>
        <div className="flex min-h-[1440px] relative">
          <div className="w-16 border-r bg-background flex-shrink-0">
            {HOURS.map(h => (
              <div key={h} className="h-[60px] text-xs text-muted-foreground text-right pr-2 relative -top-2">
                {h}:00
              </div>
            ))}
          </div>
          <div className="flex-1 relative">
            {HOURS.map(h => (
              <div key={`line-${h}`} className="absolute w-full border-b border-border/40" style={{ top: h * CELL_HEIGHT }}
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateClick(currentDate, `${h.toString().padStart(2, '0')}:00`);
                }}
              />
            ))}
            <CurrentTimeIndicator />
            {renderedEvents.map((ev: any) => (
              <TimeGridEvent key={ev.id} event={ev} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AgendaView = ({ currentDate, getEvents }: any) => {
  const days = [];
  for (let i = 0; i < 30; i++) { // Show next 30 days
    days.push(addDays(currentDate, i));
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {days.map((d, i) => {
        const events = getEvents(d);
        if (events.length === 0) return null;
        const isToday = isSameDay(d, new Date());

        return (
          <div key={i} className="flex gap-4">
            <div className="w-16 text-center pt-1">
              <div className="text-sm font-medium uppercase text-muted-foreground">{format(d, 'EEE', { locale: ptBR })}</div>
              <div className={`text-2xl font-light rounded-full w-10 h-10 flex items-center justify-center mx-auto ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>{format(d, 'd')}</div>
            </div>
            <div className="flex-1 space-y-2 border-l pl-4 pb-4">
              {events.map((ev: any) => (
                <div key={ev.id} className="widget-card p-3 flex gap-3 hover:shadow-md transition-all">
                  <div className="flex flex-col items-center">
                    <div className="text-xs font-medium">{ev.startTime}</div>
                    <div className="w-0.5 h-full bg-border my-1" />
                    <div className="text-xs text-muted-foreground">{ev.endTime}</div>
                  </div>
                  <div className="flex-1 border-l pl-3" style={{ borderLeftColor: ev.color, borderLeftWidth: '4px' }}>
                    <h4 className="font-medium text-base">{ev.title}</h4>
                    <p className="text-sm text-muted-foreground">{ev.description || ev.location || "Sem detalhes"}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded uppercase font-medium">{ev.calendarId === 'habits' ? 'Hábito' : 'Evento'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <div className="text-center text-muted-foreground text-sm pt-8 pb-4">
        Fim dos eventos dos próximos 30 dias
      </div>
    </div>
  );
};
