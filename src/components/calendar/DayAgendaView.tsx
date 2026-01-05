import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarEvent } from "@/hooks/useCalendarData";
import { Check, Clock, TrendingDown, TrendingUp, AlertCircle, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface DayAgendaViewProps {
    date: Date;
    events: CalendarEvent[];
}

export function DayAgendaView({ date, events }: DayAgendaViewProps) {
    // Groups
    const finances = events.filter(e => e.type === 'finance');
    const habits = events.filter(e => e.type === 'habit');
    const appointments = events.filter(e => e.type === 'event' || e.type === 'task');

    const isEmpty = events.length === 0;

    return (
        <div className="flex flex-col h-full bg-background/50 relative overflow-hidden">
            {/* Header do Dia */}
            <div className="px-6 pt-6 pb-2 shrink-0 flex items-end justify-between">
                <div className="flex flex-col">
                    <span className="text-secondary-foreground/60 text-sm font-medium uppercase tracking-wider mb-1">
                        Agenda do Dia
                    </span>
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        <span className="text-primary">{format(date, "d")}</span>
                        <span className="text-foreground capitalize">{format(date, "MMMM", { locale: ptBR })}</span>
                    </h2>
                    <span className="text-muted-foreground capitalize text-lg">
                        {format(date, "EEEE", { locale: ptBR })}
                    </span>
                </div>

                {/* Resumo Rápido */}
                {!isEmpty && (
                    <div className="hidden sm:flex gap-3">
                        {finances.length > 0 && (
                            <div className="flex flex-col items-center bg-red-500/10 px-3 py-2 rounded-xl text-red-500 border border-red-500/20">
                                <span className="text-xs font-bold uppercase">Finanças</span>
                                <span className="text-lg font-bold">{finances.length}</span>
                            </div>
                        )}
                        {habits.length > 0 && (
                            <div className="flex flex-col items-center bg-lime-500/10 px-3 py-2 rounded-xl text-lime-500 border border-lime-500/20">
                                <span className="text-xs font-bold uppercase">Meta</span>
                                <span className="text-lg font-bold">{habits.length}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar pb-24">

                {/* Empty State */}
                {isEmpty && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center">
                        <Quote className="w-12 h-12 mb-4 text-lime-500/50" />
                        <p className="text-lg font-serif italic text-muted-foreground max-w-xs">
                            "A disciplina é a ponte entre metas e realizações."
                        </p>

                    </div>
                )}

                {/* 1. SEÇÃO FINANCEIRA (Prioridade Máxima) */}
                {finances.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                    >
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-red-500" />
                            Movimentações Financeiras
                        </h3>
                        <div className="grid gap-2">
                            {finances.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-2xl shadow-sm relative overflow-hidden group">
                                    {/* Indicador Lateral */}
                                    <div className={cn("absolute left-0 top-0 bottom-0 w-1", item.color === '#EF4444' ? "bg-red-500" : "bg-blue-500")}></div>

                                    <div className="flex items-center gap-3 pl-2">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                            // @ts-ignore
                                            item.resource?.type === 'expense' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                                        )}>
                                            {/* @ts-ignore */}
                                            {item.resource?.type === 'expense' ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">Vencimento: Hoje</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {/* Mock Value since title has it or fetching distinct amount */}
                                        <span className={cn("font-bold", item.color === '#EF4444' ? "text-red-500" : "text-blue-500")}>
                                            {item.color === '#EF4444' ? '- R$' : '+ R$'} ---
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* 2. SEÇÃO HÁBITOS (Checklist) */}
                {habits.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-3"
                    >
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Check className="w-3 h-3 text-lime-500" />
                            Rotina & Hábitos
                        </h3>
                        <div className="grid gap-2">
                            {habits.map(habit => (
                                <label
                                    key={habit.id}
                                    className="flex items-center gap-4 p-4 bg-card/40 border border-lime-500/10 rounded-2xl cursor-pointer hover:bg-lime-500/5 transition-all select-none group"
                                >
                                    <Checkbox className="rounded-full w-6 h-6 border-2 border-lime-500/30 data-[state=checked]:bg-lime-500 data-[state=checked]:text-black" />
                                    <div className="flex-1">
                                        <span className="block font-medium text-foreground group-hover:text-lime-500 transition-colors">
                                            {habit.title.replace('Rotina: ', '')}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Todo dia
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* 3. SEÇÃO COMPROMISSOS (Timeline) */}
                {appointments.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-3"
                    >
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-3 h-3 text-amber-500" />
                            Agenda & Tarefas
                        </h3>
                        <div className="relative pl-4 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/50">
                            {appointments.map(event => (
                                <div key={event.id} className="relative pl-6">
                                    {/* Dot na linha do tempo */}
                                    <div className="absolute left-[-5px] top-1.5 w-3 h-3 rounded-full border-2 border-background bg-amber-500 ring-2 ring-amber-500/20" />

                                    <div className="bg-card border border-border/50 p-3 rounded-xl hover:border-amber-500/30 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-semibold text-sm">{event.title}</h4>
                                            <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground font-mono">
                                                {format(event.start, "HH:mm")}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {event.resource?.description || "Sem descrição adicional."}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}
            </div>
        </div>
    );
}
