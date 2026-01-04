import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Plus,
  ChevronRight,
  BookMarked,
  Check,
  Upload,
  Loader2,
  Trash2
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PdfReader } from "@/components/books/PdfReader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pdfjs } from 'react-pdf';

// Ensure worker is set for the page context as well if used directly
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface Book {
  id: string;
  title: string;
  author: string;
  file_path: string;
  current_page: number;
  total_pages: number;
  cover_url?: string;
  status?: 'reading' | 'read' | 'want'; // Computed on frontend based on progress
}

const Books = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [readingBook, setReadingBook] = useState<Book | null>(null);

  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAuthor, setUploadAuthor] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // --- QUERIES ---
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('last_read_at', { ascending: false });

      if (error) throw error;

      return data.map((b: any) => ({
        ...b,
        status: b.progress === 100 || (b.total_pages > 0 && b.current_page >= b.total_pages) ? 'read' : (b.current_page > 1 ? 'reading' : 'want'),
        progress: b.total_pages > 0 ? Math.round((b.current_page / b.total_pages) * 100) : 0
      })) as Book[];
    }
  });

  // --- MUTATIONS ---
  const uploadBookMutation = useMutation({
    mutationFn: async () => {
      if (!uploadFile || !user) throw new Error("No file or user");

      // 1. Get Page Count
      let totalPages = 0;
      try {
        const arrayBuffer = await uploadFile.arrayBuffer();
        const pdf = await pdfjs.getDocument(arrayBuffer).promise;
        totalPages = pdf.numPages;
      } catch (e) {
        console.error("Error counting pages", e);
        // Fallback or ignore
      }

      // 2. Upload File
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('books')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      // 3. Insert Record
      const { error: dbError } = await supabase
        .from('books')
        .insert({
          user_id: user.id,
          title: uploadTitle,
          author: uploadAuthor,
          file_path: filePath,
          total_pages: totalPages,
          current_page: 1
        });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setIsUploadOpen(false);
      resetUploadForm();
      toast.success("Livro adicionado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao fazer upload: " + error.message);
    }
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ id, page }: { id: string, page: number }) => {
      // Optimistic update handled via UI, this syncs with DB
      const { error } = await supabase
        .from('books')
        .update({
          current_page: page,
          last_read_at: new Date().toISOString()
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    }
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('books').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success("Livro removido.");
    }
  });

  // --- HANDLERS ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      // Auto-fill title if empty
      if (!uploadTitle) {
        setUploadTitle(file.name.replace('.pdf', ''));
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle) return;
    setIsUploading(true);
    try {
      await uploadBookMutation.mutateAsync();
    } catch (e) {
      // handled in mutation
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadTitle("");
    setUploadAuthor("");
  };

  const openReader = (book: Book) => {
    // Need public URL
    const { data } = supabase.storage.from('books').getPublicUrl(book.file_path);
    setReadingBook({ ...book, cover_url: data.publicUrl }); // abusing cover_url to pass full url slightly hacky but works
  };

  // Debounced Save
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handlePageChange = (page: number) => {
    if (!readingBook) return;

    // Update local state immediately for UI
    setReadingBook(prev => prev ? { ...prev, current_page: page } : null);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      updateProgressMutation.mutate({ id: readingBook.id, page });
    }, 1000);
  };

  // Status Stats
  const readCount = books.filter(b => b.status === "read").length;
  const readingCount = books.filter(b => b.status === "reading").length;

  return (
    <div className="page-container pb-24">
      {/* Header */}
      <motion.header
        className="mb-6 flex justify-between items-start"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-regular mb-1">Minha Biblioteca</h1>
          <p className="text-sm text-muted-foreground font-light">
            Central de conhecimento e leituras.
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} size="icon" className="rounded-full h-10 w-10 bg-[#D4F657] text-black hover:bg-[#D4F657]/80">
          <Plus className="w-5 h-5" />
        </Button>
      </motion.header>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="widget-card widget-card-lime">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4" />
            <span className="text-xs font-light opacity-80">Concluídos</span>
          </div>
          <p className="text-3xl font-regular">{readCount}</p>
        </div>

        <div className="widget-card">
          <div className="flex items-center gap-2 mb-2">
            <BookMarked className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-light text-muted-foreground">Lendo</span>
          </div>
          <p className="text-3xl font-regular">{readingCount}</p>
        </div>
      </motion.div>

      {/* Books List Grid */}
      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Biblioteca Vazia"
          description="Faça upload de livros PDF para começar a ler."
          action={<Button onClick={() => setIsUploadOpen(true)}>Adicionar PDF</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <motion.div
              key={book.id}
              className="widget-card group relative p-0 overflow-hidden flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Top Section with Icon */}
              <div className="h-28 bg-gradient-to-br from-zinc-800 to-zinc-900 border-b border-white/5 flex items-center justify-center relative">
                <BookOpen className="w-10 h-10 text-white/20" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-900/20" onClick={() => deleteBookMutation.mutate(book.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-medium text-lg capitalize leading-snug line-clamp-1 mb-1">{book.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{book.author || "Autor desconhecido"}</p>

                <div className="mt-auto space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Pág {book.current_page} de {book.total_pages}</span>
                    <span>{Math.round((book.current_page / (book.total_pages || 1)) * 100)}%</span>
                  </div>
                  <Progress value={(book.current_page / (book.total_pages || 1)) * 100} className="h-1.5" indicatorClassName="bg-[#D4F657]" />

                  <Button className="w-full mt-2 bg-[#D4F657] text-black hover:bg-[#D4F657]/80" onClick={() => openReader(book)}>
                    {book.current_page > 1 ? "Continuar Leitura" : "Ler Agora"}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reader Overlay */}
      <AnimatePresence>
        {readingBook && readingBook.cover_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <PdfReader
              fileUrl={readingBook.cover_url!} // using cover_url prop as it holds the signed/public url
              initialPage={readingBook.current_page}
              onPageChange={handlePageChange}
              onClose={() => {
                setReadingBook(null);
                queryClient.invalidateQueries({ queryKey: ['books'] });
              }}
              title={readingBook.title}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Livro</DialogTitle>
            <DialogDescription>Faça upload de um arquivo PDF (Máx. 50MB)</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-colors relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              {uploadFile ? (
                <p className="text-sm font-medium text-[#D4F657]">{uploadFile.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Clique ou arraste o PDF aqui</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="Nome do livro" />
            </div>
            <div className="space-y-2">
              <Label>Autor</Label>
              <Input value={uploadAuthor} onChange={e => setUploadAuthor(e.target.value)} placeholder="Nome do autor" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpload} disabled={isUploading || !uploadFile} className="bg-[#D4F657] text-black">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isUploading ? "Enviando..." : "Salvar Livro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Books;
