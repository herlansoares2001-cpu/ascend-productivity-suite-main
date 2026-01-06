import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    CheckCircle2,
    Wallet,
    Target,
    FileText,
    Dumbbell,
    Calendar,
    Apple,
    Heart
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const actions = [
    {
        label: "Evento",
        icon: Calendar,
        path: "/calendar",
        color: "bg-blue-500",
        delay: 0.05
    },
    {
        label: "Nota",
        icon: FileText,
        path: "/notes",
        color: "bg-yellow-500",
        delay: 0.1
    },
    {
        label: "Saúde",
        icon: Heart,
        path: "/health",
        color: "bg-pink-500",
        delay: 0.12
    },
    {
        label: "Meta",
        icon: Target,
        path: "/goals",
        color: "bg-purple-500",
        delay: 0.2
    },
    {
        label: "Transação",
        icon: Wallet,
        path: "/finances",
        color: "bg-green-500",
        delay: 0.25
    },
    {
        label: "Hábito",
        icon: CheckCircle2,
        path: "/habits",
        color: "bg-secondary", // Using app's secondary (greenish)
        delay: 0.3
    },
];

export function QuickActionFab() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleAction = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-28 md:bottom-12 right-4 z-40 flex flex-col items-end gap-3 pointer-events-none transition-all"> {/* Adjusted bottom for mobile vs desktop */}

            <AnimatePresence>
                {isOpen && (
                    <div className="flex flex-col items-end gap-3 pointer-events-auto mb-2">
                        {actions.map((action) => (
                            <motion.div
                                key={action.label}
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                transition={{ duration: 0.2, delay: action.delay }}
                                className="flex items-center gap-3"
                            >
                                <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm border border-white/10 shadow-lg">
                                    {action.label}
                                </div>

                                <Button
                                    size="icon"
                                    className={`rounded-full shadow-lg ${action.color} text-white hover:brightness-110 w-10 h-10`}
                                    onClick={() => handleAction(action.path)}
                                >
                                    <action.icon className="w-5 h-5" />
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <motion.div className="pointer-events-auto">
                <Button
                    size="icon"
                    className={`w-14 h-14 rounded-full shadow-2xl transition-colors duration-300 ${isOpen ? "bg-red-500 hover:bg-red-600" : "bg-[#D4F657] hover:bg-[#D4F657]/90 text-black"}`}
                    onClick={toggleOpen}
                >
                    <motion.div
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Plus className={`w-8 h-8 ${isOpen ? "text-white" : "text-black"}`} />
                    </motion.div>
                </Button>
            </motion.div>

            {/* Backdrop for closing when clicking outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-[-1] pointer-events-auto"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
