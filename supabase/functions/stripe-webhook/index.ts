import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
});
const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

serve(async (req) => {
    const signature = req.headers.get("stripe-signature");

    if (!signature || !endpointSecret) {
        return new Response("Webhook Error: Missing signature or secret", { status: 400 });
    }

    try {
        // 1. Verify Signature
        const body = await req.text();
        const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);

        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 2. Handle Event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata?.user_id;
            const planName = session.metadata?.plan_name;
            const customerId = session.customer;

            if (userId && planName) {
                console.log(`Processing subscription for user ${userId} -> ${planName}`);

                await supabaseClient.from('profiles').update({
                    subscription_tier: planName,
                    subscription_status: 'active',
                    stripe_customer_id: customerId as string
                }).eq('id', userId);
            }
        }
        else if (event.type === 'customer.subscription.updated') {
            // Handle renewal or cancellation logic if deeper integration needed
            // For now checkout completion is sufficient for initial access
        }
        else if (event.type === 'customer.subscription.deleted') {
            // Downgrade to free if subscription canceled
            const subscription = event.data.object;
            // We need to find user by stripe_customer_id
            const customerId = subscription.customer;
            await supabaseClient.from('profiles').update({
                subscription_tier: 'free',
                subscription_status: 'canceled'
            }).eq('stripe_customer_id', customerId);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
});
