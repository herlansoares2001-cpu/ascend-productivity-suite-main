import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Loader2, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getGlobalUserContext } from "@/lib/ai-context";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AICopilot({ customTrigger }: { customTrigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // 1. Busca o contexto financeiro/hábitos
      const contextData = await getGlobalUserContext(user.id);

      // 2. Chama a Edge Function no Supabase (Backend Seguro)
      const { data, error } = await supabase.functions.invoke('ai-copilot', {
        body: {
          messages: [...messages, userMsg],
          userContext: contextData,
          userName: user.user_metadata.full_name || 'Sócio'
        }
      });

      if (error) throw error;

      if (!data?.reply) {
        throw new Error("A resposta da IA veio vazia.");
      }

      const aiMsg = { role: 'assistant' as const, content: data.reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao conectar com o Sócio IA. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {customTrigger || (
          <Button size="icon" className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 z-50">
            <Sparkles className="h-6 w-6" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[90%] sm:w-[400px] flex flex-col h-full p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Ascend Copilot
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground mt-10">
                <p>Olá! Sou o teu Sócio Estratégico.</p>
                <p className="text-sm mt-2">Analiso os teus dados em tempo real.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 ${msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                  }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t mt-auto">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: Como estão as minhas finanças?"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
