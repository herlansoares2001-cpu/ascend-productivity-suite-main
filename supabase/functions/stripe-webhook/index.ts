// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "npm:stripe@^14.21.0";
import { createClient } from "npm:@supabase/supabase-js@^2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

serve(async (req) => {
    const signature = req.headers.get("stripe-signature");

    if (!signature || !endpointSecret) {
        return new Response("Webhook Error: Missing signature or secret", { status: 400 });
    }

    try {
        const body = await req.text();
        let event;

        try {
            event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);
        } catch (err) {
            return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        }

        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata?.user_id;
            const planName = session.metadata?.plan_name;
            const customerId = session.customer;

            if (!userId || !planName) {
                console.error("Missing metadata in Checkout Session:", session.metadata);
                // Can't proceed without userId
                return new Response("Webhook Error: Missing user_id or plan_name in metadata", { status: 400 });
            }

            if (userId && planName) {
                console.log(`Processing subscription for user ${userId} -> ${planName}`);

                // Use UPSERT to handle missing profiles
                const { data: updatedData, error: updateError } = await supabaseClient.from('profiles').upsert({
                    id: userId,
                    subscription_tier: planName,
                    subscription_status: 'active',
                    stripe_customer_id: customerId as string
                }).select();

                console.log("Upsert result:", updatedData, updateError);

                return new Response(JSON.stringify({
                    received: true,
                    debug: {
                        userId,
                        planName,
                        action: 'upsert',
                        updatedRows: updatedData?.length,
                        error: updateError
                    }
                }), {
                    headers: { "Content-Type": "application/json" },
                });
            }
        }
        else if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object;
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
