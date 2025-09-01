import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface FlutterwavePaymentRequest {
  amount: number;
  currency: string;
  email: string;
  phone_number?: string;
  name: string;
  tx_ref: string;
  redirect_url: string;
  payment_options?: string;
  customer?: {
    email: string;
    phone_number?: string;
    name: string;
  };
  customizations?: {
    title: string;
    description: string;
    logo?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FLUTTERWAVE_SECRET_KEY = Deno.env.get('FLUTTERWAVE_SECRET_KEY');
    
    if (!FLUTTERWAVE_SECRET_KEY) {
      throw new Error('Flutterwave secret key not configured');
    }

    const paymentData: FlutterwavePaymentRequest = await req.json();

    // Initialize payment with Flutterwave
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to initialize payment');
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Flutterwave initialization error:', error);
    
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message || 'Failed to initialize payment',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});