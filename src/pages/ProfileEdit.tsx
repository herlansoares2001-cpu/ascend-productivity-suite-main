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
    const [occupation, setOccupation] = useState(user?.user_metadata?.occupation || "");
    const [age, setAge] = useState(user?.user_metadata?.age || "");
    const [mainGoal, setMainGoal] = useState(user?.user_metadata?.main_goal || "");
    const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Handle Image Upload
    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = event.target.files?.[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Try to upload to 'avatars' bucket
            // Pre-requisite: Bucket 'avatars' must exist and be public
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                // Determine if it's a bucket missing error to give better feedback
                if (uploadError.message.includes("Bucket not found")) {
                    throw new Error("Erro de configuração no servidor (Bucket ausente). Contate o suporte.");
                }
                throw uploadError;
            }

            // Get Public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            setAvatarUrl(data.publicUrl);
            toast.success("Foto carregada! Clique em Salvar para confirmar.");

        } catch (error: any) {
            console.error(error);
            toast.error("Falha no upload: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!fullName.trim()) return toast.error("Nome não pode estar vazio");

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    occupation: occupation,
                    age: age,
                    main_goal: mainGoal,
                    avatar_url: avatarUrl // Save the new avatar URL
                }
            });

            if (error) throw error;

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
        <div className="min-h-screen bg-background p-6 pb-24">
            <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-semibold">Editar Perfil</h1>
                </div>

                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4 py-6">
                    <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center border-2 border-primary/20 overflow-hidden relative">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-10 h-10 text-muted-foreground" />
                            )}

                            {/* Overlay for uploading */}
                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* Hidden Input Trigger */}
                        <Input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={handleAvatarUpload}
                            disabled={uploading}
                        />

                        <div className="absolute -bottom-1 -right-1 bg-primary text-black rounded-full p-1.5 shadow-lg pointer-events-none">
                            <span className="sr-only">Alterar foto</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Toque na foto para alterar</p>
                </div>

                {/* Form Fields */}
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Profissão</Label>
                            <Input
                                value={occupation}
                                onChange={(e) => setOccupation(e.target.value)}
                                placeholder="Designer, Dev..."
                                className="bg-secondary/10 border-white/5 h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Idade</Label>
                            <Input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="Anos"
                                className="bg-secondary/10 border-white/5 h-12"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Foco Principal</Label>
                        <select
                            value={mainGoal}
                            onChange={(e) => setMainGoal(e.target.value)}
                            className="w-full bg-secondary/10 border border-white/5 rounded-md h-12 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none"
                        >
                            <option value="" disabled className="bg-background">Selecione seu foco</option>
                            <option value="productivity" className="bg-background">Produtividade Máxima</option>
                            <option value="finance" className="bg-background">Controle Financeiro</option>
                            <option value="health" className="bg-background">Saúde e Bem-estar</option>
                            <option value="studies" className="bg-background">Estudos e Leitura</option>
                        </select>
                    </div>

                    <div className="space-y-2 pt-2">
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
                    className="w-full h-12 bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity mt-6"
                    onClick={handleSave}
                    disabled={loading || uploading}
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Alterações"}
                </Button>
            </div>
        </div>
    );
};

export default ProfileEdit;
