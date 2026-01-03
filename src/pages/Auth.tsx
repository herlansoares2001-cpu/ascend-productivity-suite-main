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
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp, signInWithGoogle, signInWithApple } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const validation = authSchema.safeParse({ email, password, fullName });
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
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Este email já está cadastrado");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Conta criada com sucesso!");
          navigate("/");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error("Erro ao conectar com Google. Configure o provedor no backend.");
    }
  };

  const handleAppleLogin = async () => {
    const { error } = await signInWithApple();
    if (error) {
      toast.error("Erro ao conectar com Apple. Configure o provedor no backend.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-10">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo/Title */}
        <div className="text-center mb-10">
          <motion.div
            className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
          >
            <span className="text-2xl font-regular text-primary-foreground">P</span>
          </motion.div>
          <h1 className="text-2xl font-regular mb-2">Produtividade</h1>
          <p className="text-sm text-muted-foreground font-light">
            {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <motion.button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-card border border-border hover:bg-muted transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Chrome className="w-5 h-5" />
            <span className="font-light">Continuar com Google</span>
          </motion.button>

          <motion.button
            onClick={handleAppleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-card border border-border hover:bg-muted transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span className="font-light">Continuar com Apple</span>
          </motion.button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-light">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nome completo"
                className="w-full bg-card border border-border rounded-2xl py-3 pl-12 pr-4 text-sm font-light placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
              />
            </div>
          )}

          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className={`w-full bg-card border rounded-2xl py-3 pl-12 pr-4 text-sm font-light placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 ${errors.email ? 'border-destructive' : 'border-border'}`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive mt-1 ml-1">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className={`w-full bg-card border rounded-2xl py-3 pl-12 pr-4 text-sm font-light placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 ${errors.password ? 'border-destructive' : 'border-border'}`}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive mt-1 ml-1">{errors.password}</p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-regular flex items-center justify-center gap-2 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isLogin ? "Entrar" : "Criar conta"
            )}
          </motion.button>
        </form>

        {/* Toggle Login/Signup */}
        <p className="text-center text-sm text-muted-foreground font-light mt-6">
          {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
