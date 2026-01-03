import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/lib/event-storage";

interface EventFormProps {
    defaultDate?: Date;
    defaultStartTime?: string;
    calendars: Calendar[];
    onSubmit: (data: { title: string; startTime: string; endTime: string; location: string; calendarId: string; description: string }) => void;
    onCancel: () => void;
}

export function EventForm({ defaultDate, defaultStartTime, calendars, onSubmit, onCancel }: EventFormProps) {
    const [title, setTitle] = useState("");
    const [startTime, setStartTime] = useState(defaultStartTime || "09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [calendarId, setCalendarId] = useState(calendars[0]?.id || "personal");

    // Auto-set end time when start changes (1 hour duration)
    useEffect(() => {
        if (startTime) {
            const [h, m] = startTime.split(':').map(Number);
            const endH = h + 1;
            setEndTime(`${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        }
    }, [startTime]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !calendarId) return;
        onSubmit({ title, startTime, endTime, location, calendarId, description });
    };

    const validCalendars = calendars.filter(c => c.id !== 'habits'); // Filters out virtual calendar

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Título</Label>
                <Input
                    placeholder="Ex: Reunião, Médico..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    autoFocus
                    required
                />
            </div>

            <div className="space-y-2">
                <Label>Calendário</Label>
                <Select value={calendarId} onValueChange={setCalendarId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        {validCalendars.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                                    {c.name}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Início</Label>
                    <Input
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Fim</Label>
                    <Input
                        type="time"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Local (Opcional)</Label>
                <Input
                    placeholder="Ex: Escritório"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Descrição (Opcional)</Label>
                <Input
                    placeholder="Detalhes..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                    Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                    Agendar
                </Button>
            </div>
        </form>
    );
}
