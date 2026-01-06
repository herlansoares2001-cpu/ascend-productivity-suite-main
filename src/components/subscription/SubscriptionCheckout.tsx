import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X } from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface SubscriptionCheckoutProps {
    plan: string;
    isOpen: boolean;
    onClose: () => void;
}

export const SubscriptionCheckout = ({ plan, isOpen, onClose }: SubscriptionCheckoutProps) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && plan) {
            fetchClientSecret();
        }
    }, [isOpen, plan]);

    const fetchClientSecret = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return;

            const response = await fetch('https://ahubncrfcdxsqrloqaeb.supabase.co/functions/v1/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plan }),
            });

            const data = await response.json();
            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
            } else {
                toast.error("Erro ao carregar checkout: " + (data.error || "Desconhecido"));
                onClose();
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro de conexão");
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl h-[80vh] p-0 bg-background overflow-hidden flex flex-col">
                <DialogDescription className="sr-only">Checkout de Assinatura</DialogDescription>
                <div className="p-4 border-b flex items-center gap-3 bg-card/50">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <DialogTitle className="text-lg font-semibold">Assinar Plano {plan === 'standard' ? 'Standard' : 'Premium'}</DialogTitle>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {clientSecret && (
                        <EmbeddedCheckoutProvider
                            stripe={stripePromise}
                            options={{ clientSecret }}
                        >
                            <EmbeddedCheckout className="h-full" />
                        </EmbeddedCheckoutProvider>
                    )}
                    {!clientSecret && (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
