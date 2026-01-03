export interface CalendarEventData {
    id: string;
    title: string;
    dateStr: string;
    startTime: string;
    endTime: string;
    location?: string;
    description?: string;
    calendarId: string;
    // Google Sync Fields
    googleEventId?: string;
    iCalUID?: string;
    etag?: string;
    lastSyncedAt?: string;
}

export interface Calendar {
    id: string;
    name: string;
    color: string;
    visible: boolean;
    // Google Sync Fields
    googleId?: string;
    provider?: 'local' | 'google';
    accessRole?: string;
}

const STORAGE_KEY_EVENTS = 'ascend_calendar_events';
const STORAGE_KEY_CALENDARS = 'ascend_calendar_configs';

const DEFAULT_CALENDARS: Calendar[] = [
    { id: 'personal', name: 'Pessoal', color: '#EBFF57', visible: true, provider: 'local' },
    { id: 'work', name: 'Trabalho', color: '#57BFFF', visible: true, provider: 'local' },
];

export const getStoredEvents = (): CalendarEventData[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
    return stored ? JSON.parse(stored) : [];
};

export const saveStoredEvents = (events: CalendarEventData[]) => {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
};

export const addStoredEvent = (event: Omit<CalendarEventData, 'id'>) => {
    const events = getStoredEvents();
    const newEvent = { ...event, id: crypto.randomUUID() };
    saveStoredEvents([...events, newEvent]);
    return newEvent;
};

export const updateStoredEvent = (event: CalendarEventData) => {
    const events = getStoredEvents();
    const index = events.findIndex(e => e.id === event.id);
    if (index !== -1) {
        events[index] = event;
        saveStoredEvents(events);
    }
};

export const deleteStoredEvent = (eventId: string) => {
    const events = getStoredEvents();
    const newEvents = events.filter(e => e.id !== eventId);
    saveStoredEvents(newEvents);
};

export const getStoredCalendars = (): Calendar[] => {
    if (typeof window === 'undefined') return DEFAULT_CALENDARS;
    const stored = localStorage.getItem(STORAGE_KEY_CALENDARS);
    return stored ? JSON.parse(stored) : DEFAULT_CALENDARS;
};

export const saveStoredCalendars = (calendars: Calendar[]) => {
    localStorage.setItem(STORAGE_KEY_CALENDARS, JSON.stringify(calendars));
};
