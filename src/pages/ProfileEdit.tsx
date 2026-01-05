import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ProfileEdit = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!fullName.trim()) return toast.error("Nome não pode estar vazio");

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            if (error) throw error;

            // Update profile table as well if it exists and is separate
            // But typically user_metadata is enough for Auth context
            // Assuming 'profiles' table syncs via triggers or we should update it manually:
            await supabase.from('profiles').update({ full_name: fullName }).eq('id', user?.id);

            toast.success("Perfil atualizado com sucesso!");
            navigate("/profile");
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao atualizar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-semibold">Editar Perfil</h1>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-4 py-6">
                        <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center border-2 border-primary/20">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                                alt="Avatar"
                                className="w-20 h-20 rounded-full"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">O avatar é gerado automaticamente baseado no seu email.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome Completo</Label>
                            <Input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Seu nome"
                                className="bg-secondary/10 border-white/5 h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                value={user?.email || ""}
                                disabled
                                className="bg-secondary/10 border-white/5 h-12 opacity-50 cursor-not-allowed"
                            />
                            <p className="text-[10px] text-muted-foreground">O email não pode ser alterado.</p>
                        </div>
                    </div>

                    <Button
                        className="w-full h-12 bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Alterações"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfileEdit;
