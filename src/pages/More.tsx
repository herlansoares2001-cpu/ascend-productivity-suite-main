import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Dumbbell,
  FileText,
  Target,
  ChevronRight,
  Apple,
  Flame,
  Settings
} from "lucide-react";
import { CalendarWidget } from "@/components/widgets/CalendarWidget";
import { IntegrationsSettings } from "@/components/settings/IntegrationsSettings";
import { toast } from "sonner";

const modules = [
  // ... (keep modules list same)
  {
    id: "books",
    name: "Leituras",
    description: "Biblioteca e progresso",
    icon: BookOpen,
    path: "/books",
    color: "#EBFF57",
    stats: "8 livros lidos"
  },
  {
    id: "workout",
    name: "Treino",
    description: "Exercícios e progresso",
    icon: Dumbbell,
    path: "/workout",
    color: "#A2F7A1",
    stats: "156 treinos"
  },
  {
    id: "diet",
    name: "Dieta",
    description: "Refeições e macros",
    icon: Apple,
    path: "/diet",
    color: "#FF6B6B",
    stats: "1.850 kcal hoje"
  },
  {
    id: "notes",
    name: "Anotações",
    description: "Notas rápidas",
    icon: FileText,
    path: "/notes",
    color: "#4ECDC4",
    stats: "23 notas"
  },
  {
    id: "goals",
    name: "Metas 2026",
    description: "Grandes objetivos",
    icon: Target,
    path: "/goals",
    color: "#9B59B6",
    stats: "3 metas ativas"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const More = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("connected")) {
      toast.success("Google Agenda conectado com sucesso!");
      // Clean URL
      setSearchParams(params => {
        params.delete("connected");
        return params;
      });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="page-container pb-28">
      {/* Calendar Widget Section */}
      <CalendarWidget />

      <div className="w-full h-px bg-border/50 my-6" />

      {/* Modules Section Header */}
      <motion.header
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-regular mb-1">Produtividade</h1>
        <p className="text-sm text-muted-foreground font-light">
          Módulos e estatísticas
        </p>
      </motion.header>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-2 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="widget-card widget-card-lime">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-light opacity-80">Streak Total</span>
          </div>
          <p className="text-3xl font-regular">42</p>
          <p className="text-xs font-light opacity-70">dias de produtividade</p>
        </div>

        <div className="widget-card widget-card-green">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4" />
            <span className="text-xs font-light opacity-80">Metas</span>
          </div>
          <p className="text-3xl font-regular">35%</p>
          <p className="text-xs font-light opacity-70">progresso médio</p>
        </div>
      </motion.div>

      {/* Modules List */}
      <motion.div
        className="space-y-3 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <motion.div key={module.id} variants={itemVariants}>
              <Link to={module.path}>
                <motion.div
                  className="widget-card flex items-center gap-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${module.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: module.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-regular">{module.name}</h3>
                    <p className="text-sm text-muted-foreground font-light">{module.stats}</p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="w-full h-px bg-border/50 my-6" />

      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5" />
          <h2 className="section-title mb-0"><span>Configurações & Integrações</span></h2>
        </div>
        <IntegrationsSettings />
      </section>
    </div>
  );
};

export default More;
