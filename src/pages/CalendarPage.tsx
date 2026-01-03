import { useState } from "react";
import { useCalendarData } from "@/hooks/useCalendarData";
import { ModernCalendar } from "@/components/calendar/ModernCalendar";
import { DayAgendaView } from "@/components/calendar/DayAgendaView";
import { Loader2, Plus, Clock, MapPin, Link as LinkIcon, Users, Bell, Repeat, Calendar as CalendarIcon, AlignLeft } from "lucide-react";
import { motion } from "framer-motion";
import { isSameDay, format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: events = [], isLoading } = useCalendarData();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<'all' | 'habit' | 'event'>('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FORM STATES (Google Calendar Style) ---
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD
  const [endTime, setEndTime] = useState("10:00");
  const [isAllDay, setIsAllDay] = useState(false);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [guests, setGuests] = useState(""); // Simple string for now
  const [selectedColor, setSelectedColor] = useState("#D4F657"); // Default Neon
  const [recurrence, setRecurrence] = useState("none");
  const [notificationTime, setNotificationTime] = useState("10"); // minutes
  const [calendarContext, setCalendarContext] = useState("Pessoal");

  // Recalcula lista ao mudar dia ou filtro
  const selectedDayEvents = events.filter(e => {
    const isDayMatch = isSameDay(e.start, selectedDate);
    if (!isDayMatch) return false;
    if (filter === 'all') return true;
    if (filter === 'habit' && e.type === 'habit') return true;
    if (filter === 'event' && (e.type === 'event' || e.type === 'task')) return true;
    return false;
  });

  const handleCreateNew = () => {
    // Init form with selected date default
    const maxDateStr = format(selectedDate, "yyyy-MM-dd");
    setTitle("");
    setStartDate(maxDateStr);
    setEndDate(maxDateStr);
    setStartTime("09:00");
    setEndTime("10:00");
    setIsAllDay(false);
    setDescription("");
    setLocation("");
    setMeetingLink("");
    setGuests("");
    setRecurrence("none");
    setCalendarContext("Pessoal");
    setIsCreateModalOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!title) return toast.error("O título é obrigatório");
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Build ISO timestamps
      const startISO = `${startDate}T${isAllDay ? '00:00:00' : `${startTime}:00`}`;
      const endISO = `${endDate}T${isAllDay ? '23:59:59' : `${endTime}:00`}`;

      const guestList = guests.split(',').map(g => g.trim()).filter(g => g);

      const { error } = await supabase
        .from("events")
        .insert({
          user_id: user.id,
          title,
          description,
          start_time: startISO,
          end_time: endISO,
          is_all_day: isAllDay,
          color: selectedColor,
          location: location || null,
          meeting_url: meetingLink || null,
          guests: guestList.length > 0 ? guestList : [],
          is_recurring: recurrence !== 'none',
          recurrence_rule: recurrence !== 'none' ? `FREQ=${recurrence.toUpperCase()}` : null,
          calendar_context: calendarContext
        });

      if (error) throw error;

      toast.success("Evento agendado!");
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["calendar-data"] });
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container min-h-screen w-full flex flex-col relative bg-background pb-32 md:pb-12">

      {/* TOP: Heatmap & Filters */}
      <div className="flex-none flex flex-col z-10 bg-background/80 backdrop-blur-md pb-2 pt-2 sticky top-0 md:relative border-b border-[#D4F657]/20 shadow-sm">
        <div className="px-2 sm:px-6">
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4F657]" />
            </div>
          ) : (
            <ModernCalendar
              events={events}
              date={selectedDate}
              onDateChange={setSelectedDate}
              currentFilter={filter}
              onFilterChange={setFilter}
            />
          )}
        </div>
      </div>

      {/* DASHBOARD: Agenda View */}
      <div className="flex-1 w-full mt-2">
        <DayAgendaView date={selectedDate} events={selectedDayEvents} />
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 h-16 w-16 text-black font-bold rounded-full shadow-[0_0_25px_rgba(212,246,87,0.5)] flex items-center justify-center z-[9999]"
        style={{ backgroundColor: '#D4F657' }}
        onClick={handleCreateNew}
      >
        <Plus className="w-8 h-8 stroke-[3px]" />
      </motion.button>

      {/* MODAL (Google Style - Fixed Duplicates) */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-[#D4F657]/20 p-0 gap-0 rounded-2xl">
          <DialogDescription className="sr-only">Formulário para criar novo evento</DialogDescription>

          {/* Header: Action Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 sticky top-0 z-50 backdrop-blur-xl">
            <DialogTitle className="text-lg font-medium flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-[#D4F657]" />
              Novo Evento
            </DialogTitle>
            <div className="flex gap-4 items-center">
              <Button
                size="sm"
                className="h-8 bg-[#D4F657] text-black hover:bg-[#D4F657]/80 font-bold px-6"
                onClick={handleSaveEvent}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
              </Button>
              <DialogClose asChild>
                <button className="text-muted-foreground hover:text-white transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </DialogClose>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 1. Título & Data */}
            <div className="space-y-4">
              <Input
                placeholder="Adicionar título"
                className="text-2xl font-normal border-0 border-b border-white/20 rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#D4F657] placeholder:text-muted-foreground/50 bg-transparent h-auto py-2"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
              />

              {/* Date & Time Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                  <Clock className="w-4 h-4 text-[#D4F657]" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-[130px] h-8 border-0 bg-transparent p-0 focus-visible:ring-0 text-white"
                  />
                  {!isAllDay && (
                    <>
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        className="w-[70px] h-8 border-0 bg-transparent p-0 focus-visible:ring-0 text-white"
                      />
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Label htmlFor="all-day" className="cursor-pointer text-muted-foreground">Dia inteiro</Label>
                  <Switch id="all-day" checked={isAllDay} onCheckedChange={setIsAllDay} className="data-[state=checked]:bg-[#D4F657]" />
                </div>
              </div>

              {/* Recorrência */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground hover:bg-white/5 p-2 rounded-lg cursor-pointer transition-colors w-fit">
                <Repeat className="w-4 h-4" />
                <Select value={recurrence} onValueChange={setRecurrence}>
                  <SelectTrigger className="border-0 bg-transparent h-auto p-0 focus:ring-0 text-white w-[180px]">
                    <SelectValue placeholder="Não se repete" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    <SelectItem value="none">Não se repete</SelectItem>
                    <SelectItem value="daily">Todos os dias</SelectItem>
                    <SelectItem value="weekly">Semanalmente</SelectItem>
                    <SelectItem value="monthly">Mensalmente</SelectItem>
                    <SelectItem value="yearly">Anualmente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 2. Tabs for Details */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-white/10 rounded-none h-auto p-0 mb-4">
                <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#D4F657] data-[state=active]:bg-transparent px-4 py-2">Detalhes</TabsTrigger>
                <TabsTrigger value="people" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#D4F657] data-[state=active]:bg-transparent px-4 py-2">Convidados</TabsTrigger>
                <TabsTrigger value="more" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#D4F657] data-[state=active]:bg-transparent px-4 py-2">Mais</TabsTrigger>
              </TabsList>

              {/* TAB: General Details */}
              <TabsContent value="details" className="space-y-4">
                <div className="flex gap-3 items-center">
                  <div className="w-8 flex justify-center"><Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400"><AlignLeft className="w-4 h-4" /></Button></div>
                  <Button variant="outline" className="h-9 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 justify-start flex-1" onClick={() => setMeetingLink("https://meet.google.com/new")}>
                    Adicionar videoconferência
                  </Button>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-8 flex justify-center"><MapPin className="w-5 h-5 text-muted-foreground" /></div>
                  <Input
                    placeholder="Adicionar local"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="bg-transparent border-0 border-b border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-[#D4F657]"
                  />
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-8 flex justify-center pt-2"><AlignLeft className="w-5 h-5 text-muted-foreground" /></div>
                  <Textarea
                    placeholder="Adicionar descrição ou anexos"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="bg-white/5 border-0 focus-visible:ring-1 focus-visible:ring-[#D4F657] min-h-[100px]"
                  />
                </div>
              </TabsContent>

              {/* TAB: Guests */}
              <TabsContent value="people" className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="w-8 flex justify-center pt-2"><Users className="w-5 h-5 text-muted-foreground" /></div>
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Adicionar emails (separados por vírgula)"
                      value={guests}
                      onChange={e => setGuests(e.target.value)}
                      className="bg-transparent border border-white/10 rounded-lg focus-visible:ring-[#D4F657]"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* TAB: More */}
              <TabsContent value="more" className="space-y-4">
                <div className="flex gap-3 items-center">
                  <div className="w-8 flex justify-center"><Bell className="w-5 h-5 text-muted-foreground" /></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Notificação:</span>
                    <Input
                      type="number"
                      value={notificationTime}
                      onChange={e => setNotificationTime(e.target.value)}
                      className="w-16 h-8 bg-white/5 border-0 text-center"
                    />
                    <span className="text-sm text-muted-foreground">minutos antes</span>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-8 flex justify-center"><div className="w-4 h-4 rounded-full bg-[#D4F657]" /></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Cor:</span>
                    <div className="flex gap-1">
                      {["#D4F657", "#EF4444", "#3B82F6", "#A855F7"].map(c => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={cn(
                            "w-6 h-6 rounded-full border-2",
                            selectedColor === c ? "border-white" : "border-transparent"
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-8 flex justify-center"><CalendarIcon className="w-5 h-5 text-muted-foreground" /></div>
                  <Select value={calendarContext} onValueChange={setCalendarContext}>
                    <SelectTrigger className="w-[180px] h-8 border-white/10 bg-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pessoal">Pessoal</SelectItem>
                      <SelectItem value="Trabalho">Trabalho</SelectItem>
                      <SelectItem value="Família">Família</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
