import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getGlobalUserContext } from "@/lib/ai-context";
import { FileText } from "lucide-react";
import { useFinancialData } from "@/hooks/useFinancialData";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AICopilotProps {
  customTrigger?: React.ReactNode;
}

export function AICopilot({ customTrigger }: AICopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! 👋 Sou seu assistente pessoal. Posso ajudar você a:\n\n• Adicionar transações (ex: \"débito de 50 em lazer\")\n• Criar hábitos (ex: \"criar hábito de meditar\")\n• Adicionar tarefas e lembretes\n• Criar notas\n\nComo posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { totalBalance } = useFinancialData();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // 1. Fetch Context (RAG)
      let contextData = null;
      try {
        const rawContext = await getGlobalUserContext(user.id);
        contextData = {
          ...rawContext,
          finance: {
            ...rawContext.finance,
            balance: totalBalance
          }
        };
        console.log("AI Context loaded:", contextData);
      } catch (err) {
        console.warn("Failed to load AI context:", err);
      }

      // 2. Invoke Edge Function with Context
      const { data, error } = await supabase.functions.invoke("ai-copilot", {
        body: { message: userMessage.content, userId: user.id, contextData },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Show toast for successful actions and refresh data
      if (data.actions && data.actions.length > 0) {
        data.actions.forEach((action: { success: boolean; message: string }) => {
          if (action.success) {
            toast.success(action.message);
          }
        });
        // Invalidate all queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["habits"] });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["reminders"] });
        queryClient.invalidateQueries({ queryKey: ["notes"] });
      }
    } catch (error: any) {
      console.error("AI Copilot error:", error);

      let errorMessage = "Desculpe, ocorreu um erro. Tente novamente.";
      if (error.message?.includes("429")) {
        errorMessage = "Limite de requisições excedido. Aguarde alguns segundos.";
      } else if (error.message?.includes("402")) {
        errorMessage = "Créditos insuficientes para usar a IA.";
      }

      toast.error(errorMessage);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDailyAnalysis = () => {
    sendMessage("Analise meu estado atual e me dê 3 insights curtos e acionáveis sobre meu dia. Foque em finanças, tarefas e hábitos. Seja motivador.");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Trigger: Custom or Floating */}
      {customTrigger ? (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          {customTrigger}
        </div>
      ) : (
        <motion.button
          className="fixed bottom-24 left-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg"
          style={{
            boxShadow: "0 4px 20px hsl(68 100% 67% / 0.4)",
          }}
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.5 }}
        >
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </motion.button>
      )}

      {/* Chat Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="h-[85vh] max-h-[600px]">
          <DrawerHeader className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <DrawerTitle className="text-left">Assistente IA</DrawerTitle>
                <p className="text-xs text-muted-foreground">Seu copiloto pessoal (v2.0)</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={generateDailyAnalysis} disabled={isLoading} className="hidden sm:flex">
              <FileText className="w-4 h-4 mr-2" />
              Gerar Análise
            </Button>
          </DrawerHeader>

          <div className="flex flex-col flex-1 overflow-hidden px-4">
            {/* Messages */}
            <ScrollArea className="flex-1 py-4" ref={scrollRef}>
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border"
                          }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-card border border-border rounded-2xl px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border pt-4 pb-6">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
