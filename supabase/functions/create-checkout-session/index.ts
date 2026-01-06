import Stripe from "npm:stripe@^14.21.0";
import { createClient } from "npm:@supabase/supabase-js@^2.45.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

        if (!stripeKey || !supabaseUrl || !supabaseKey) {
            return new Response(JSON.stringify({ error: "Missing Env Vars" }), { status: 500, headers: corsHeaders });
        }

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "No Authorization Header" }), { status: 401, headers: corsHeaders });
        }

        const supabase = createClient(
            supabaseUrl,
            supabaseKey,
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.log("Auth failed:", authError);
            return new Response(JSON.stringify({
                error: "Auth Failed",
                details: authError?.message || "No user info"
            }), { status: 401, headers: corsHeaders });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders });
        }

        const { plan } = body;
        const email = user.email;

        const stripe = new Stripe(stripeKey, {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        });

        let priceData;
        if (plan === 'standard') {
            priceData = {
                currency: 'brl',
                product_data: { name: 'Ascend Standard', description: 'Plano Standard - Mensal' },
                unit_amount: 2990,
                recurring: { interval: 'month' },
            };
        } else if (plan === 'premium') {
            priceData = {
                currency: 'brl',
                product_data: { name: 'Ascend Premium', description: 'Plano Premium - Mensal' },
                unit_amount: 5990,
                recurring: { interval: 'month' },
            };
        } else {
            return new Response(JSON.stringify({ error: "Invalid plan" }), { status: 400, headers: corsHeaders });
        }

        const customers = await stripe.customers.list({ email: email, limit: 1 });
        let customerId = customers.data.length > 0 ? customers.data[0].id : null;

        if (!customerId) {
            const customer = await stripe.customers.create({ email: email, metadata: { backend_user_id: user.id } });
            customerId = customer.id;
        }

        const origin = req.headers.get("origin") || "http://localhost:8080";

        // EMBEDDED CHECKOUT SESSION
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            ui_mode: 'embedded', // Crucial change for embedded view
            customer: customerId,
            line_items: [{ price_data: priceData, quantity: 1 }],
            return_url: `${origin}/plans?session_id={CHECKOUT_SESSION_ID}&success=true`,
            metadata: { user_id: user.id, plan_name: plan }
        });

        return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Exception: " + (error.message || String(error)) }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
