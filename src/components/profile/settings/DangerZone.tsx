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
            // Trying standard deleteUser call (often blocked client-side)
            const { error } = await supabase.rpc('delete_user');

            if (error) {
                // If RPC fails or doesn't exist, try manual data wipe + sign out as fallback
                console.warn("RPC delete_user failed or missing, wiping data instead.", error);

                // Manually trigger reset logic if delete fails (fallback)
                // Note: userResetAccount is async mutation, but we want to wait here.
                // MutateAsync is better if available, but useMutation provides mutate.
                // Let's just try to call the reset RPC directly here as fallback to avoid hook state complexity in this specific fallback flow,
                // OR just call resetAccount.mutateAsync() if I update the hook to return it, but standard useMutation returns mutate (void) and mutateAsync (promise).
                // Let's use mutateAsync.
                await resetAccount.mutateAsync();

                toast.info("Conta limpa e desconectada. (Exclusão total requer suporte)");
            } else {
                toast.success("Conta excluída permanentemente.");
            }

            await signOut();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir conta.");
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
                                <AlertDialogDescription className="space-y-4">
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
