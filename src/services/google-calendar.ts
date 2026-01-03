import { supabase } from "@/integrations/supabase/client";
import {
    getStoredCalendars,
    saveStoredCalendars,
    getStoredEvents,
    saveStoredEvents,
    CalendarEventData
} from "@/lib/event-storage";

const SESSION_STORAGE_TOKEN_KEY = "google_provider_token_secure";

// Security Clean up
if (typeof window !== 'undefined') {
    localStorage.removeItem("google_provider_token");
}

export const GoogleCalendarService = {
    async connect() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin + "/more?connected=true", // Redirect to settings/more
                scopes: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly",
                queryParams: {
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        });
        if (error) throw error;
        return data;
    },

    setAccessToken(token: string) {
        if (!token) {
            sessionStorage.removeItem(SESSION_STORAGE_TOKEN_KEY);
        } else {
            sessionStorage.setItem(SESSION_STORAGE_TOKEN_KEY, token);
        }
    },

    getAccessToken() {
        return sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY);
    },

    async listCalendars() {
        const token = this.getAccessToken();
        if (!token) throw new Error("No access token");

        const res = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
            if (res.status === 401) throw new Error("Token expired");
            throw new Error("Failed to fetch calendars");
        }

        const data = await res.json();
        return data.items;
    },

    async fetchEvents(calendarId: string, timeMin?: string, timeMax?: string) {
        const token = this.getAccessToken();
        if (!token) throw new Error("No access token");

        const now = new Date();
        const start = new Date(now); start.setMonth(now.getMonth() - 1);
        const end = new Date(now); end.setMonth(now.getMonth() + 3);

        const min = timeMin || start.toISOString();
        const max = timeMax || end.toISOString();

        const params = new URLSearchParams({
            timeMin: min,
            timeMax: max,
            singleEvents: "true",
            maxResults: "250"
        });

        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch events");
        return await res.json();
    },

    async syncFull() {
        try {
            console.log("Starting Full Sync...");
            // A. Sync Calendars
            const googleCalendars = await this.listCalendars();
            const localCalendars = getStoredCalendars();

            const mergedCalendars = [...localCalendars];
            let calendarsUpdated = false;

            for (const gCal of googleCalendars) {
                const existing = mergedCalendars.find(c => c.googleId === gCal.id);
                if (!existing) {
                    mergedCalendars.push({
                        id: crypto.randomUUID(),
                        googleId: gCal.id,
                        name: gCal.summary,
                        color: gCal.backgroundColor || "#4285F4",
                        visible: true,
                        provider: 'google',
                        accessRole: gCal.accessRole
                    });
                    calendarsUpdated = true;
                }
            }

            if (calendarsUpdated) saveStoredCalendars(mergedCalendars);

            // B. Sync Events
            const currentEvents = getStoredEvents();
            let eventsUpdated = false;
            const newEventsList = [...currentEvents];

            // Filter for Google Calendars that are visible
            const activeGoogleCals = mergedCalendars.filter(c => c.provider === 'google' && c.visible && c.googleId);

            for (const cal of activeGoogleCals) {
                if (!cal.googleId) continue;
                const gEventsData = await this.fetchEvents(cal.googleId);
                const gEvents = gEventsData.items || [];

                for (const gEv of gEvents) {
                    if (gEv.status === 'cancelled') continue;

                    const existingEvIndex = newEventsList.findIndex(e => e.googleEventId === gEv.id);

                    const startDateTime = gEv.start.dateTime || gEv.start.date;
                    const endDateTime = gEv.end.dateTime || gEv.end.date;

                    const startDateObj = new Date(startDateTime);
                    const endDateObj = new Date(endDateTime);

                    const dateStr = startDateObj.toISOString().split('T')[0];
                    // Handle "All Day" events (date only, no time) -> Default 00:00 to 23:59 or specific
                    const isAllDay = !gEv.start.dateTime;
                    const startTime = isAllDay ? "00:00" : startDateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    const endTime = isAllDay ? "23:59" : endDateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                    const eventData: CalendarEventData = {
                        id: existingEvIndex !== -1 ? newEventsList[existingEvIndex].id : crypto.randomUUID(),
                        title: gEv.summary || "(Sem título)",
                        dateStr: dateStr,
                        startTime: startTime,
                        endTime: endTime,
                        location: gEv.location,
                        description: gEv.description,
                        calendarId: cal.id,
                        googleEventId: gEv.id,
                        iCalUID: gEv.iCalUID,
                        etag: gEv.etag,
                        lastSyncedAt: new Date().toISOString()
                    };

                    if (existingEvIndex !== -1) {
                        newEventsList[existingEvIndex] = eventData;
                    } else {
                        newEventsList.push(eventData);
                    }
                    eventsUpdated = true;
                }
            }

            if (eventsUpdated) {
                saveStoredEvents(newEventsList);
                return { success: true, updated: true };
            }

            return { success: true, updated: false };

        } catch (error) {
            console.error("Sync Logic Failed", error);
            throw error;
        }
    }
};
