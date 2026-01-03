import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Plus, 
  ChevronRight,
  BookMarked,
  Check
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

interface Book {
  id: string;
  title: string;
  author: string;
  status: "want" | "reading" | "read";
  progress: number;
  cover?: string;
}

const initialBooks: Book[] = [
  { id: "1", title: "Atomic Habits", author: "James Clear", status: "reading", progress: 85 },
  { id: "2", title: "O Poder do Hábito", author: "Charles Duhigg", status: "read", progress: 100 },
  { id: "3", title: "Deep Work", author: "Cal Newport", status: "reading", progress: 42 },
  { id: "4", title: "Thinking, Fast and Slow", author: "Daniel Kahneman", status: "want", progress: 0 },
  { id: "5", title: "Essencialismo", author: "Greg McKeown", status: "read", progress: 100 },
];

const statusLabels = {
  want: "Quero Ler",
  reading: "Lendo",
  read: "Lido",
};

const Books = () => {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [activeFilter, setActiveFilter] = useState<"all" | "want" | "reading" | "read">("all");

  const filteredBooks = activeFilter === "all" 
    ? books 
    : books.filter(b => b.status === activeFilter);

  const readCount = books.filter(b => b.status === "read").length;
  const readingCount = books.filter(b => b.status === "reading").length;

  return (
    <div className="page-container">
      {/* Header */}
      <motion.header 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-regular mb-1">Leituras</h1>
        <p className="text-sm text-muted-foreground font-light">
          Sua biblioteca pessoal
        </p>
      </motion.header>

      {/* Stats */}
      <motion.div 
        className="grid grid-cols-2 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="widget-card widget-card-lime">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4" />
            <span className="text-xs font-light opacity-80">Lidos</span>
          </div>
          <p className="text-3xl font-regular">{readCount}</p>
          <p className="text-xs font-light opacity-70">livros completados</p>
        </div>

        <div className="widget-card">
          <div className="flex items-center gap-2 mb-2">
            <BookMarked className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-light text-muted-foreground">Lendo</span>
          </div>
          <p className="text-3xl font-regular">{readingCount}</p>
          <p className="text-xs font-light text-muted-foreground">em andamento</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <button 
          className={`chip whitespace-nowrap ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          Todos
        </button>
        <button 
          className={`chip whitespace-nowrap ${activeFilter === "reading" ? "active" : ""}`}
          onClick={() => setActiveFilter("reading")}
        >
          Lendo
        </button>
        <button 
          className={`chip whitespace-nowrap ${activeFilter === "want" ? "active" : ""}`}
          onClick={() => setActiveFilter("want")}
        >
          Quero Ler
        </button>
        <button 
          className={`chip whitespace-nowrap ${activeFilter === "read" ? "active" : ""}`}
          onClick={() => setActiveFilter("read")}
        >
          Lidos
        </button>
      </motion.div>

      {/* Books List */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-regular">{filteredBooks.length} livros</h2>
        <motion.button 
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </motion.button>
      </div>

      {filteredBooks.length === 0 ? (
        <EmptyState 
          icon={BookOpen}
          title="Nenhum livro"
          description="Adicione livros à sua biblioteca para acompanhar seu progresso."
        />
      ) : (
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {filteredBooks.map((book, index) => (
            <motion.div
              key={book.id}
              className="widget-card flex gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-regular truncate">{book.title}</h3>
                <p className="text-sm text-muted-foreground font-light mb-2">{book.author}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    book.status === "read" 
                      ? "bg-secondary/20 text-secondary" 
                      : book.status === "reading"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {statusLabels[book.status]}
                  </span>
                  
                  {book.status === "reading" && (
                    <span className="text-xs text-muted-foreground">{book.progress}%</span>
                  )}
                </div>

                {book.status === "reading" && (
                  <div className="progress-bar h-1.5 mt-2">
                    <motion.div 
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${book.progress}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                )}
              </div>

              <ChevronRight className="w-5 h-5 text-muted-foreground self-center" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Books;
