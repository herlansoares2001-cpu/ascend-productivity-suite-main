import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Share2,
  Trash2,
  X,
  Save,
  Loader2
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useNotes, Note } from "@/hooks/useNotes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Share } from '@capacitor/share';
import { toast } from "sonner";

const Notes = () => {
  const { notes, isLoading, createNote, deleteNote, updateNote } = useNotes(); // Assuming updateQuickNote is for the quick widget, we might need a general updateNote in useNotes hook?
  // Checking useNotes hook again... it has updateNoteMutation but it wasn't exported directly, only updateQuickNote used it. 
  // I need to update useNotes hook to export a general update function.
  // For now I will assume I can fix useNotes hook next. I will use a placeholder 'updateNote' here.

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const filteredNotes = notes.filter(note =>
    (note.content || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.is_quick_note ? "Anotação Rápida" : "Nota"); // Notes table might not have title column based on QuickNotesWidget usage? 
    // QuickNotesWidget uses 'content' only. The 'notes' table schema likely has 'content'. 
    // Step 1236 showed 'Note' interface having 'title'. Does the DB have 'title'?
    // Step 1239 useNotes 'Note' interface: id, user_id, content, is_quick_note, created_at. NO TITLE.
    // So notes are just content. I will handle Title as first line of content or just use content.
    setContent(note.content);
    setIsEditing(false); // View mode first
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    try {
      if (selectedNote) {
        // Update
        await updateNote.mutateAsync({ id: selectedNote.id, content });
        toast.success("Nota atualizada!");
        setIsDialogOpen(false);
      } else {
        // Create
        await createNote.mutateAsync(content);
        toast.success("Nota criada!");
        setIsDialogOpen(false);
      }
    } catch (e) {
      toast.error("Erro ao salvar");
    }
  };

  const handleShare = async (note: Note) => {
    try {
      await Share.share({
        title: 'Minha Nota',
        text: note.content,
        dialogTitle: 'Compartilhar Nota',
      });
    } catch (error) {
      console.log('Error sharing:', error);
      // Fallback for web
      if ((navigator as any).share) {
        (navigator as any).share({
          title: 'Minha Nota',
          text: note.content
        });
      } else {
        toast.info("Compartilhamento nativo não suportado neste navegador.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    await deleteNote.mutateAsync(id);
    setIsDialogOpen(false);
    toast.success("Nota excluída");
  };

  return (
    <div className="page-container pb-24">
      {/* Header */}
      <motion.header
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-regular mb-1">Anotações</h1>
        <p className="text-sm text-muted-foreground font-light">
          Suas ideias e lembretes.
        </p>
      </motion.header>

      {/* Search */}
      <motion.div className="relative mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar nas notas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-card border border-border font-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </motion.div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
      ) : filteredNotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma nota encontrada"
          description="Toque no + para criar sua primeira nota."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              className="widget-card relative group cursor-pointer hover:bg-card/80 transition-colors"
              layoutId={`note-${note.id}`}
              onClick={() => handleOpenNote(note)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`w-2 h-2 rounded-full ${note.is_quick_note ? 'bg-blue-400' : 'bg-yellow-400'}`} />
                {/* Share Button (Mini) */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleShare(note); }}
                  className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white"
                >
                  <Share2 className="w-3 h-3" />
                </button>
              </div>

              <p className="text-sm font-regular line-clamp-4 text-left">
                {note.content || "Sem conteúdo"}
              </p>

              <p className="text-[10px] text-muted-foreground mt-3 font-light">
                {format(new Date(note.created_at || new Date()), "d MMM, HH:mm", { locale: ptBR })}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* FAB */}
      <motion.div
        className="fixed right-5"
        style={{ bottom: "calc(7.5rem + env(safe-area-inset-bottom))" }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
      >
        <button
          onClick={handleCreate}
          className="w-16 h-16 rounded-full bg-[#D4F657] text-black flex items-center justify-center shadow-[0_0_25px_rgba(212,246,87,0.4)]"
        >
          <Plus className="w-8 h-8 stroke-[3px]" />
        </button>
      </motion.div>

      {/* View/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md h-[80vh] flex flex-col p-0 gap-0 bg-[#09090b] border-white/10">
          <DialogHeader className="px-6 py-4 border-b border-white/5 flex flex-row items-center justify-between">
            <DialogTitle>{isEditing ? (selectedNote ? "Editar Nota" : "Nova Nota") : "Visualizar Nota"}</DialogTitle>
            <div className="flex gap-2">
              {!isEditing && selectedNote && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => handleShare(selectedNote)}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                    <FileText className="w-4 h-4" /> {/* Edit Icon placeholder */}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-400" onClick={() => handleDelete(selectedNote.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 p-6 overflow-y-auto">
            {isEditing ? (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full bg-transparent border-none focus-visible:ring-0 text-base resize-none"
                placeholder="Escreva sua nota aqui..."
              />
            ) : (
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                {content}
              </div>
            )}
          </div>

          {isEditing && (
            <div className="p-4 border-t border-white/5">
              <Button onClick={handleSave} className="w-full bg-[#D4F657] text-black hover:bg-[#D4F657]/80">
                <Save className="w-4 h-4 mr-2" />
                Salvar Nota
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notes;
