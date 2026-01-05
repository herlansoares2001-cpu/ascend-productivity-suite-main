import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { UserX, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { useResetAccount } from '@/hooks/useProfile';

export function DangerZone() {
    const { signOut } = useAuth();
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    // Hook for resetting account
    const resetAccount = useResetAccount();
    const isResetting = resetAccount.isPending;

    const handleResetAllData = async () => {
        resetAccount.mutate();
    };

    const handleDeleteAccount = async () => {
        if (deleteInput !== "DELETAR") {
            toast.error("Digite DELETAR para confirmar.");
            return;
        }

        setIsDeletingAccount(true);
        try {
            // 1. Try to delete the user from Auth (RP call)
            const { error } = await supabase.rpc('delete_user');

            if (!error) {
                // SUCCESS: User is deleted from DB.
                // The session token is now invalid, so signOut() would likely 403.
                // We just force clear client state.
                toast.success("Conta excluída permanentemente.");

                // Manually clear storage to be safe
                localStorage.clear();

                // Force redirect to login
                window.location.href = "/auth";
                return;
            }

            // FAILURE: RPC failed/missing. Fallback to data wipe.
            console.warn("RPC delete_user failed, wiping data instead.", error);

            // 2. Wipe Data (Fallback)
            await resetAccount.mutateAsync();
            toast.info("Dados limpos (Exclusão total requer suporte ou execução do SQL).");

            // 3. Sign Out (safe)
            try {
                await signOut();
            } catch (e) {
                console.error("SignOut failed", e);
            }

            window.location.href = "/auth";

        } catch (error) {
            console.error(error);
            toast.error("Erro ao tentar excluir conta.");
        } finally {
            setIsDeletingAccount(false);
            setOpenDeleteModal(false);
        }
    };

    return (
        <div className="space-y-6 pt-8 mt-8 border-t border-red-500/20 animate-in fade-in duration-500 delay-200">
            <div className="flex items-center gap-2 pb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-lg text-red-500">Zona de Perigo</h3>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-xl overflow-hidden divide-y divide-red-500/10">
                {/* Reset Data */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h4 className="font-medium text-red-100">Resetar Todos os Dados</h4>
                        <p className="text-sm text-red-400/60">Apaga hábitos, finanças e registros. Sua conta permanece ativa.</p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50">
                                {isResetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                Começar do Zero
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-zinc-950 border-red-500/20">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-500">Tem certeza absoluta?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Isso apagará permanentemente todos os seus dados (transações, hábitos, histórico).
                                    Essa ação não pode ser desfeita. Você começará com o app vazio.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={(e) => { e.preventDefault(); handleResetAllData(); }} className="bg-red-500 hover:bg-red-600 text-white">
                                    Sim, Resetar Tudo
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                {/* Delete Account */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-red-500/5">
                    <div>
                        <h4 className="font-medium text-red-100">Excluir Conta Permanentemente</h4>
                        <p className="text-sm text-red-400/60">Remove seu acesso e todos os dados associados. Irreversível.</p>
                    </div>

                    <AlertDialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
                                <UserX className="w-4 h-4 mr-2" />
                                Excluir Conta
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-zinc-950 border-red-500/20">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-500">Excluir Conta Permanentemente</AlertDialogTitle>
                                <AlertDialogDescription asChild className="space-y-4">
                                    <div>
                                        <p>Esta ação é <strong>irreversível</strong>. Todos os seus dados serão perdidos para sempre.</p>
                                        <div className="space-y-2">
                                            <p className="text-sm">Digite <strong>DELETAR</strong> para confirmar:</p>
                                            <Input
                                                value={deleteInput}
                                                onChange={(e) => setDeleteInput(e.target.value)}
                                                className="bg-black/50 border-red-500/30 text-red-500 placeholder:text-red-500/20"
                                                placeholder="DELETAR"
                                            />
                                        </div>
                                    </div>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteInput("")}>Cancelar</AlertDialogCancel>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                    disabled={deleteInput !== "DELETAR" || isDeletingAccount}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {isDeletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Exclusão"}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}
