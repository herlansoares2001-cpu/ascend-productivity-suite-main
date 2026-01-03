export interface Calendar {
    id: string;
    name: string;
    color: string;
    visible: boolean;
    provider?: 'local' | 'google';
    googleId?: string; // Google Calendar ID
    syncToken?: string; // For incremental sync
    accessRole?: string;
}

export interface CalendarEventData {
    id: string;
    title: string;
    dateStr: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    location?: string;
    calendarId: string;
    description?: string;
    // Google Sync Fields
    googleEventId?: string;
    iCalUID?: string;
    etag?: string;
    lastSyncedAt?: string;
}

const EVENTS_KEY = 'ascend_calendar_events_v2';
const CALENDARS_KEY = 'ascend_calendars_v2';

const DEFAULT_CALENDARS: Calendar[] = [
    { id: 'work', name: 'Trabalho', color: '#3B82F6', visible: true, provider: 'local' }, // Blue
    { id: 'personal', name: 'Pessoal', color: '#10B981', visible: true, provider: 'local' }, // Green
    { id: 'family', name: 'Família', color: '#F59E0B', visible: true, provider: 'local' }, // Orange
];

const INITIAL_EVENTS: CalendarEventData[] = [
    { id: "1", title: "Reunião de Planejamento", dateStr: "2025-12-15", startTime: "09:00", endTime: "10:30", location: "Escritório", calendarId: "work" },
    { id: "2", title: "Almoço com cliente", dateStr: "2025-12-15", startTime: "12:30", endTime: "14:00", location: "Restaurante", calendarId: "work" },
];

export function getStoredCalendars(): Calendar[] {
    if (typeof window === 'undefined') return DEFAULT_CALENDARS;
    const stored = localStorage.getItem(CALENDARS_KEY);
    if (!stored) return DEFAULT_CALENDARS;
    return JSON.parse(stored);
}

export function saveStoredCalendars(calendars: Calendar[]) {
    localStorage.setItem(CALENDARS_KEY, JSON.stringify(calendars));
}

export function getStoredEvents(): CalendarEventData[] {
    if (typeof window === 'undefined') return INITIAL_EVENTS;
    const stored = localStorage.getItem(EVENTS_KEY);
    if (!stored) {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(INITIAL_EVENTS));
        return INITIAL_EVENTS;
    }
    return JSON.parse(stored);
}

export function saveStoredEvents(events: CalendarEventData[]) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export function addStoredEvent(event: Omit<CalendarEventData, "id">): CalendarEventData {
    const events = getStoredEvents();
    const newEvent = { ...event, id: crypto.randomUUID() };
    const updated = [...events, newEvent];
    saveStoredEvents(updated);
    return newEvent;
}

export function updateStoredEvent(updatedEvent: CalendarEventData) {
    const events = getStoredEvents();
    const index = events.findIndex(e => e.id === updatedEvent.id);
    if (index !== -1) {
        events[index] = updatedEvent;
        saveStoredEvents(events);
    }
}
