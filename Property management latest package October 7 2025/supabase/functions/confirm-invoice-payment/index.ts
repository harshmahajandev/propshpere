Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { paymentIntentId } = await req.json();

        console.log('Payment confirmation request:', { paymentIntentId });

        if (!paymentIntentId) {
            throw new Error('Payment intent ID is required');
        }

        // Get environment variables
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!stripeSecretKey || !serviceRoleKey || !supabaseUrl) {
            throw new Error('Missing required environment variables');
        }

        // Retrieve payment intent from Stripe
        const stripeResponse = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`
            }
        });

        if (!stripeResponse.ok) {
            throw new Error('Failed to retrieve payment intent from Stripe');
        }

        const paymentIntent = await stripeResponse.json();
        
        if (paymentIntent.status !== 'succeeded') {
            throw new Error(`Payment not completed. Status: ${paymentIntent.status}`);
        }

        const invoiceId = paymentIntent.metadata.invoice_id;
        if (!invoiceId) {
            throw new Error('Invoice ID not found in payment intent metadata');
        }

        console.log('Payment succeeded, updating invoice:', invoiceId);

        // Update invoice status to paid
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/invoices?id=eq.${invoiceId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'paid',
                payment_date: new Date().toISOString(),
                payment_method: 'stripe',
                stripe_payment_intent_id: paymentIntentId,
                updated_at: new Date().toISOString()
            })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update invoice status');
        }

        // Create financial record for the payment
        const financialRecord = {
            type: 'payment',
            category: 'invoice_payment',
            amount: paymentIntent.amount_received / 100, // Convert from cents
            currency: paymentIntent.currency.toUpperCase(),
            transaction_date: new Date().toISOString(),
            invoice_id: invoiceId,
            description: `Payment received for invoice ${paymentIntent.metadata.invoice_number}`,
            payment_method: 'stripe',
            reference_number: paymentIntentId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const financialResponse = await fetch(`${supabaseUrl}/rest/v1/financial_records`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(financialRecord)
        });

        if (!financialResponse.ok) {
            console.error('Failed to create financial record, but invoice was updated');
        } else {
            console.log('Financial record created successfully');
        }

        const result = {
            data: {
                success: true,
                invoiceId: invoiceId,
                paymentIntentId: paymentIntentId,
                amount: paymentIntent.amount_received / 100,
                currency: paymentIntent.currency,
                paidAt: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Payment confirmation error:', error);

        const errorResponse = {
            error: {
                code: 'PAYMENT_CONFIRMATION_FAILED',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
