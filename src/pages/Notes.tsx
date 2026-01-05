import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  MoreVertical
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  color: string;
}

const initialNotes: Note[] = [
  {
    id: "1",
    title: "Ideias para o projeto",
    content: "- Implementar dark mode\n- Adicionar animações\n- Revisar arquitetura",
    date: "Hoje",
    color: "#EBFF57"
  },
  {
    id: "2",
    title: "Lista de compras",
    content: "Frutas, legumes, proteínas, grãos integrais",
    date: "Ontem",
    color: "#A2F7A1"
  },
  {
    id: "3",
    title: "Resumo do livro",
    content: "Capítulo 3: O poder dos hábitos atômicos está na capacidade de...",
    date: "3 dias atrás",
    color: "#4ECDC4"
  },
  {
    id: "4",
    title: "Metas da semana",
    content: "1. Terminar relatório\n2. Reunião com equipe\n3. Revisar código",
    date: "5 dias atrás",
    color: "#9B59B6"
  },
];

const Notes = () => {
  const [notes] = useState<Note[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Header */}
      <motion.header
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-regular mb-1">Anotações</h1>
        <p className="text-sm text-muted-foreground font-light">
          Notas rápidas com suporte a Markdown
        </p>
      </motion.header>

      {/* Search */}
      <motion.div
        className="relative mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar notas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-card border border-border font-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </motion.div>

      {/* Stats */}
      <motion.div
        className="flex gap-4 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="widget-card flex-1 text-center py-4">
          <p className="text-2xl font-regular text-primary">{notes.length}</p>
          <p className="text-xs text-muted-foreground font-light">Total de notas</p>
        </div>
        <div className="widget-card flex-1 text-center py-4">
          <p className="text-2xl font-regular text-secondary">2</p>
          <p className="text-xs text-muted-foreground font-light">Esta semana</p>
        </div>
      </motion.div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma nota"
          description="Crie notas rápidas para organizar suas ideias."
        />
      ) : (
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              className="widget-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: note.color }}
                />
                <button className="p-1 -mr-1 -mt-1">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <h3 className="font-regular text-sm mb-2 line-clamp-1">{note.title}</h3>
              <p className="text-xs text-muted-foreground font-light line-clamp-3 mb-3">
                {note.content}
              </p>
              <p className="text-xs text-muted-foreground/60 font-light">{note.date}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* FAB */}
      <motion.div
        className="fixed right-5"
        style={{ bottom: "calc(7.5rem + env(safe-area-inset-bottom))" }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
      >
        <motion.button
          className="w-16 h-16 rounded-full bg-[#D4F657] text-black flex items-center justify-center shadow-[0_0_25px_rgba(212,246,87,0.4)]"
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="w-8 h-8 stroke-[3px]" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Notes;
