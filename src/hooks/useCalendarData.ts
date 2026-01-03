import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { format, parseISO, startOfDay, addHours } from "date-fns";

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: any;
    type: 'event' | 'habit' | 'task' | 'finance';
    color?: string;
}

export function useCalendarData() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["calendar-data", user?.id],
        queryFn: async () => {
            if (!user) return [];

            // 1. Fetch Events (Compromissos)
            const { data: events } = await supabase
                .from("events")
                .select("*")
                .eq("user_id", user.id);

            // 2. Fetch Habits
            const { data: habits } = await supabase
                .from("habits")
                .select("*")
                .eq("user_id", user.id)
                .eq("is_archived", false);

            // 3. Fetch Tasks
            const { data: tasks } = await supabase
                .from("tasks")
                .select("*")
                .eq("user_id", user.id)
                .eq("completed", false);


            const calendarEvents: CalendarEvent[] = [];

            // Map Events
            events?.forEach(e => {
                calendarEvents.push({
                    id: `event-${e.id}`,
                    title: e.title,
                    start: parseISO(e.start_time),
                    end: parseISO(e.end_time),
                    allDay: e.is_all_day,
                    type: 'event',
                    color: e.color || '#D9F99D', // Lime-300 (Suave, parecido com o tema)
                    resource: e
                });
            });

            // Map Habits (Mock de visualização diária)
            habits?.forEach(h => {
                calendarEvents.push({
                    id: `habit-${h.id}-today`,
                    title: `Rotina: ${h.name}`,
                    start: startOfDay(new Date()),
                    end: addHours(startOfDay(new Date()), 1),
                    allDay: true,
                    type: 'habit',
                    color: '#34D399', // Emerald-400
                    resource: h
                })
            });

            // Map Tasks
            tasks?.forEach(t => {
                calendarEvents.push({
                    id: `task-${t.id}`,
                    title: `Tarefa: ${t.title}`,
                    start: parseISO(t.created_at),
                    end: addHours(parseISO(t.created_at), 1),
                    allDay: false,
                    type: 'task',
                    color: '#FBBF24', // Amber-400
                    resource: t
                })
            });

            return calendarEvents;
        },
        enabled: !!user
    });
}
