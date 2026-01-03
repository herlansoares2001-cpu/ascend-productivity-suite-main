export interface CalendarEventData {
    id: string;
    title: string;
    dateStr: string;
    startTime: string;
    endTime: string;
    location?: string;
    description?: string;
    calendarId: string;
}

export interface Calendar {
    id: string;
    name: string;
    color: string;
    visible: boolean;
}

const STORAGE_KEY_EVENTS = 'ascend_calendar_events';
const STORAGE_KEY_CALENDARS = 'ascend_calendar_configs';

const DEFAULT_CALENDARS: Calendar[] = [
    { id: 'personal', name: 'Pessoal', color: '#EBFF57', visible: true },
    { id: 'work', name: 'Trabalho', color: '#57BFFF', visible: true },
];

export const getStoredEvents = (): CalendarEventData[] => {
    const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
    return stored ? JSON.parse(stored) : [];
};

export const addStoredEvent = (event: Omit<CalendarEventData, 'id'>) => {
    const events = getStoredEvents();
    const newEvent = { ...event, id: crypto.randomUUID() };
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify([...events, newEvent]));
    return newEvent;
};

export const updateStoredEvent = (event: CalendarEventData) => {
    const events = getStoredEvents();
    const index = events.findIndex(e => e.id === event.id);
    if (index !== -1) {
        events[index] = event;
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    }
};

export const getStoredCalendars = (): Calendar[] => {
    const stored = localStorage.getItem(STORAGE_KEY_CALENDARS);
    return stored ? JSON.parse(stored) : DEFAULT_CALENDARS;
};

export const saveStoredCalendars = (calendars: Calendar[]) => {
    localStorage.setItem(STORAGE_KEY_CALENDARS, JSON.stringify(calendars));
};
