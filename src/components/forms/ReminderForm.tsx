import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReminderFormProps {
  onSubmit: (data: { text: string; priority: string }) => void;
  onCancel: () => void;
  initialData?: { text: string; priority: string };
  isLoading?: boolean;
}

export function ReminderForm({ onSubmit, onCancel, initialData, isLoading }: ReminderFormProps) {
  const [text, setText] = useState(initialData?.text || "");
  const [priority, setPriority] = useState(initialData?.priority || "medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({ text: text.trim(), priority });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="text">Lembrete</Label>
        <Input
          id="text"
          placeholder="O que você precisa lembrar?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Prioridade</Label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Criar Lembrete"}
        </Button>
      </div>
    </form>
  );
}
