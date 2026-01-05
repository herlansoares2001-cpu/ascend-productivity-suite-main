import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Mail, Lock, User, Loader2, Chrome } from "lucide-react";
import { z } from "zod";


const authSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  fullName: z.string().trim().optional(),
  occupation: z.string().trim().optional(),
  age: z.string().optional(),
  mainGoal: z.string().optional(),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [age, setAge] = useState("");
  const [mainGoal, setMainGoal] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, signUp, signInWithGoogle, signInWithApple } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = authSchema.safeParse({ email, password, fullName, occupation, age, mainGoal });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou senha incorretos");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Login realizado com sucesso!");
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password, {
          fullName,
          occupation,
          age,
          mainGoal
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Este email já está cadastrado");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Conta criada! Verifique seu email se necessário.");
          // Auto login or redirect? Typically Supabase auto-logs in unless email confirm is strictly enforced blocking login.
          // If strictly enforced, they can't login yet.
          // Let's assume auto-login works or redirect to dashboard.
          navigate("/");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ... (Social Login Handlers remain same)

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-black selection:bg-primary/30">
      {/* ... (Backgrounds remain same) ... */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] opacity-20" />

      <motion.div
        className="w-full max-w-[400px] relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl ring-1 ring-white/5">

          {/* Header */}
          <div className="text-center mb-6">
            {/* ... Logo ... */}
            <motion.div
              className="w-20 h-20 mx-auto mb-4 flex items-center justify-center relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <img src="/logo.png" alt="Ascend Logo" className="w-full h-full object-contain relative z-10" />
            </motion.div>

            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
              {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
            </h1>
            <p className="text-xs text-zinc-400">
              {isLogin ? "Acesse seu segundo cérebro digital" : "Junte-se a nós e evolua."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nome completo"
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative group">
                    <input
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="Profissão"
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Idade"
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <select
                    value={mainGoal}
                    onChange={(e) => setMainGoal(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                    style={{ color: mainGoal ? 'white' : '#52525b' }} // zinc-600 for placeholder feel
                  >
                    <option value="" disabled>Qual seu foco principal?</option>
                    <option value="productivity" className="bg-zinc-900">Produtividade Máxima</option>
                    <option value="finance" className="bg-zinc-900">Controle Financeiro</option>
                    <option value="health" className="bg-zinc-900">Saúde e Bem-estar</option>
                    <option value="studies" className="bg-zinc-900">Estudos e Leitura</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1">
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu email"
                  className={`w-full bg-black/20 border rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all ${errors.email ? 'border-red-500/50' : 'border-white/10'}`}
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-400 pl-1">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className={`w-full bg-black/20 border rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all ${errors.password ? 'border-red-500/50' : 'border-white/10'}`}
                />
              </div>
              {errors.password && <p className="text-[10px] text-red-400 pl-1">{errors.password}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-primary text-black font-bold text-sm shadow-[0_0_20px_rgba(212,246,87,0.3)] hover:shadow-[0_0_30px_rgba(212,246,87,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLogin ? "Entrar" : "Criar Conta"
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-zinc-500">
              {isLogin ? "Ainda não tem acesso?" : "Já possui conta?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline underline-offset-4"
              >
                {isLogin ? "Criar conta gratuitamente" : "Fazer login"}
              </button>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-[10px] text-zinc-600 mt-8">
          &copy; 2026 Segundo Cérebro. Todos os direitos reservados.
        </p>
      </motion.div>
    </div>
  );
}
