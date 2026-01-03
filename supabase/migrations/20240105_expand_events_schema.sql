-- Migration to add Google Calendar-like fields to events table

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS meeting_url text, -- For Google Meet/Zoom links
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/Sao_Paulo',
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_rule text, -- RRULE format (e.g., FREQ=WEEKLY)
ADD COLUMN IF NOT EXISTS guests jsonb DEFAULT '[]'::jsonb, -- Array of guest emails/objects
ADD COLUMN IF NOT EXISTS notifications jsonb DEFAULT '[{"time": 10, "unit": "minutes"}]'::jsonb, -- Array of reminders
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb; -- Array of file links

-- Add calendar_context column separately
ALTER TABLE events
ADD COLUMN IF NOT EXISTS calendar_context text DEFAULT 'Pessoal'; -- Pessoal, Trabalho, Família
