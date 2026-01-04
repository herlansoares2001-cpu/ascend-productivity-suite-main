import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

// Configure worker for React-PDF
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface PdfReaderProps {
    fileUrl: string;
    initialPage: number;
    totalServerPages?: number; // Optional fallbacks
    onPageChange: (page: number) => void;
    onClose: () => void;
    title?: string;
}

export function PdfReader({ fileUrl, initialPage, onPageChange, onClose, title }: PdfReaderProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(initialPage || 1);
    const [scale, setScale] = useState(1.0);
    const [inputValue, setInputValue] = useState(String(initialPage));

    useEffect(() => {
        setPageNumber(initialPage);
        setInputValue(String(initialPage));
    }, [initialPage]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const changePage = (offset: number) => {
        setPageNumber(prevPageNumber => {
            const newPage = Math.min(Math.max(1, prevPageNumber + offset), numPages || 1);
            setInputValue(String(newPage));
            onPageChange(newPage);
            return newPage;
        });
    };

    const handleInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const page = parseInt(inputValue);
        if (page >= 1 && page <= (numPages || 10000)) {
            setPageNumber(page);
            onPageChange(page);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col h-screen w-screen">
            {/* Header Controls */}
            <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-white/10">
                <div className="flex items-center gap-4 text-white">
                    <h2 className="text-sm font-medium hidden md:block opacity-80">{title || "Leitor PDF"}</h2>
                    <div className="flex items-center gap-2 bg-black/50 rounded-lg px-2 py-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/10" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}><ZoomOut className="w-4 h-4" /></Button>
                        <span className="text-xs min-w-[3ch] text-center">{Math.round(scale * 100)}%</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/10" onClick={() => setScale(s => Math.min(2.0, s + 0.1))}><ZoomIn className="w-4 h-4" /></Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-white/70 hover:text-white" onClick={onClose}>
                        <X className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto flex justify-center p-4 bg-[#1a1a1a] relative">
                <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="flex flex-col items-center justify-center h-full gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-[#D4F657]" />
                            <p className="text-sm text-gray-400">Carregando documento...</p>
                        </div>
                    }
                    error={
                        <div className="flex flex-col items-center justify-center h-full text-red-400">
                            <p>Erro ao carregar PDF.</p>
                        </div>
                    }
                    className="shadow-2xl"
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="shadow-xl"
                        loading={<div className="h-[600px] w-[400px] bg-white/5 animate-pulse rounded" />}
                    />
                </Document>
            </div>

            {/* Footer Navigation */}
            <div className="p-4 bg-zinc-900 border-t border-white/10 flex justify-center items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    disabled={pageNumber <= 1}
                    onClick={() => changePage(-1)}
                    className="rounded-full border-white/10 hover:bg-white/5 text-white"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>

                <form onSubmit={handleInputSubmit} className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Página</span>
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-16 h-8 text-center bg-black/50 border-white/10 text-white"
                    />
                    <span className="text-sm text-gray-400">de {numPages || '--'}</span>
                </form>

                <Button
                    variant="outline"
                    size="icon"
                    disabled={pageNumber >= (numPages || 1)}
                    onClick={() => changePage(1)}
                    className="rounded-full border-white/10 hover:bg-white/5 text-white"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
