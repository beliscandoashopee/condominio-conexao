
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("Stripe checkout function invoked");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const requestData = await req.json();
    console.log("Request data:", requestData);
    
    const { userId, packageId, amount, price, name } = requestData;
    
    if (!userId || !packageId || !amount || !price) {
      console.error("Missing required fields in request data");
      throw new Error("Missing required fields");
    }

    // Check if we have a valid Stripe key
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY environment variable is not set or empty");
      throw new Error("Stripe key not configured");
    }
    
    // Log the type of key (live or test) without revealing the actual key
    console.log(`Using ${stripeKey.startsWith('sk_live') ? 'LIVE' : 'TEST'} Stripe key`);

    // Initialize Stripe with explicit API version
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      maxNetworkRetries: 3, // Increase retries for better reliability
      timeout: 30000, // Set longer timeout (30 seconds)
    });
    
    console.log("Creating Stripe checkout session");
    
    try {
      // Get Supabase URL for webhook domain verification
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const origin = req.headers.get('origin') || '';
      
      // Create the checkout session with optimized settings
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: name || `Pacote de ${amount} créditos`,
                description: `${amount} créditos para usar no marketplace`,
              },
              unit_amount: Math.round(price * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/purchase-credits`,
        metadata: {
          userId: userId,
          packageId: packageId,
          amount: amount.toString(),
          applicationUrl: origin,
        },
        client_reference_id: userId,
        // Set shorter expiration - 30 minutes instead of default 24 hours
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        // Collect customer email for better tracking
        billing_address_collection: 'auto',
        // Load faster by optimizing page transition
        payment_intent_data: {
          setup_future_usage: 'off_session',
          description: `Compra de ${amount} créditos - Pacote: ${name}`,
          metadata: {
            userId: userId,
            packageId: packageId,
            creditsAmount: amount.toString(),
          },
        },
        // Allow customer to validate their card without payment
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic',
          },
        },
      });
      
      console.log("Checkout session created:", session.id);
      console.log("Checkout URL:", session.url);
      
      if (!session.url) {
        throw new Error("Session URL is undefined");
      }
      
      return new Response(
        JSON.stringify({ 
          url: session.url,
          sessionId: session.id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (stripeError) {
      console.error("Stripe API error:", stripeError.message);
      console.error("Stripe error code:", stripeError.code);
      console.error("Stripe error type:", stripeError.type);
      
      // Capture detailed error information for diagnostics
      const errorDetails = {
        message: stripeError.message,
        code: stripeError.code,
        type: stripeError.type,
        param: stripeError.param,
        requestId: stripeError.requestId,
        statusCode: stripeError.statusCode,
      };
      
      console.error("Full Stripe error details:", JSON.stringify(errorDetails, null, 2));
      
      // More specific error message based on Stripe error
      let errorMessage = "Falha ao criar sessão de checkout";
      
      if (stripeError.type === 'StripeAuthenticationError') {
        errorMessage = "Erro de autenticação com o Stripe. Verifique a chave API.";
      } else if (stripeError.type === 'StripeConnectionError') {
        errorMessage = "Não foi possível conectar ao Stripe. Verifique sua conexão.";
      } else if (stripeError.type === 'StripeRateLimitError') {
        errorMessage = "Limite de requisições ao Stripe excedido. Tente novamente em alguns instantes.";
      } else if (stripeError.type === 'StripeInvalidRequestError') {
        errorMessage = `Requisição inválida: ${stripeError.message}`;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: stripeError.message,
          errorId: stripeError.requestId
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Falha ao criar sessão de checkout",
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
