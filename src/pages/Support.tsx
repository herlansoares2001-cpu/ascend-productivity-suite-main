import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Send, MessageSquare, Clock, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/EmptyState";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const ticketSchema = z.object({
    subject: z.string().min(5, "O assunto deve ter pelo menos 5 caracteres"),
    message: z.string().min(10, "Detalhe melhor seu problema"),
});

const Support = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch Tickets
    const { data: tickets, isLoading } = useQuery({
        queryKey: ["support-tickets"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("support_tickets")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });

    // Create Ticket Mutation
    const form = useForm<z.infer<typeof ticketSchema>>({
        resolver: zodResolver(ticketSchema),
        defaultValues: { subject: "", message: "" },
    });

    const createTicket = useMutation({
        mutationFn: async (values: z.infer<typeof ticketSchema>) => {
            const { error } = await supabase.from("support_tickets").insert({
                user_id: user?.id,
                subject: values.subject,
                message: values.message,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
            setIsDialogOpen(false);
            form.reset();
            toast.success("Solicitação enviada!", {
                description: "Responderemos em breve por e-mail ou notificação.",
            });
        },
        onError: () => {
            toast.error("Erro ao enviar solicitação.");
        },
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "open":
                return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> Aberto</Badge>;
            case "in_progress":
                return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"><AlertCircle className="w-3 h-3 mr-1" /> Em Análise</Badge>;
            case "resolved":
            case "closed":
                return <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Resolvido</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="page-container pb-28">
            <motion.header
                className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="text-2xl font-semibold mb-1">Central de Ajuda</h1>
                    <p className="text-sm text-muted-foreground">Tire dúvidas, reporte bugs ou envie sugestões.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#D4F657] text-black hover:bg-[#D4F657]/90 rounded-full">
                            <Plus className="w-4 h-4 mr-2" /> Novo Chamado
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Como podemos ajudar?</DialogTitle>
                            <DialogDescription>
                                Descreva seu problema ou sugestão abaixo.
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit((data) => createTicket.mutate(data))} className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Assunto</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Erro no pagamento, Sugestão..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mensagem</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Descreva detalhadamente o que aconteceu..."
                                                    className="min-h-[120px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full bg-[#D4F657] text-black hover:bg-[#D4F657]/90" disabled={createTicket.isPending}>
                                    {createTicket.isPending ? "Enviando..." : "Enviar Solicitação"}
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </motion.header>

            {/* FAQ ou Lista de Tickets */}
            <div className="space-y-6">
                <h2 className="text-lg font-medium">Seus Chamados</h2>

                {isLoading ? (
                    <div className="text-center py-10 text-muted-foreground">Carregando...</div>
                ) : tickets?.length === 0 ? (
                    <EmptyState
                        icon={MessageSquare}
                        title="Nenhum chamado"
                        description="Você ainda não abriu nenhuma solicitação de suporte."
                    />
                ) : (
                    <div className="grid gap-3">
                        {tickets?.map((ticket) => (
                            <motion.div
                                key={ticket.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <Card className="bg-card/50 border-white/5 hover:border-white/10 transition-colors">
                                    <CardContent className="p-4 flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-medium truncate text-base">{ticket.subject}</h4>
                                                {getStatusBadge(ticket.status)}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate max-w-[80%]">
                                                {ticket.message}
                                            </p>
                                            <p className="text-xs text-zinc-600 mt-2">
                                                {new Date(ticket.created_at).toLocaleDateString('pt-BR')} às {new Date(ticket.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-zinc-900/50 border border-white/5 text-center">
                <h3 className="text-lg font-medium mb-2">Prefere contato direto?</h3>
                <p className="text-muted-foreground text-sm mb-4">Envie um e-mail diretamente para nossa equipe.</p>
                <Button variant="outline" onClick={() => window.open('mailto:seuemail@ascend.com')}>
                    <Send className="w-4 h-4 mr-2" /> Enviar E-mail
                </Button>
            </div>
        </div>
    );
};

export default Support;
