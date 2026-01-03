import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TaskFormProps {
  onSubmit: (data: { title: string }) => void;
  onCancel: () => void;
  initialData?: { title: string };
  isLoading?: boolean;
}

export function TaskForm({ onSubmit, onCancel, initialData, isLoading }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Tarefa</Label>
        <Input
          id="title"
          placeholder="O que você precisa fazer?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Criar Tarefa"}
        </Button>
      </div>
    </form>
  );
}
