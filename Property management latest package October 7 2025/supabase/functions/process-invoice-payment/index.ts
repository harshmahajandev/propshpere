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
        const { invoiceId, customerEmail } = await req.json();

        console.log('Invoice payment request:', { invoiceId, customerEmail });

        // Validate required parameters
        if (!invoiceId) {
            throw new Error('Invoice ID is required');
        }

        // Get environment variables
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!stripeSecretKey) {
            throw new Error('Stripe secret key not configured');
        }

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Fetch invoice details from database
        const invoiceResponse = await fetch(`${supabaseUrl}/rest/v1/invoices?id=eq.${invoiceId}&select=*,customer:profiles!customer_id(full_name,email)`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!invoiceResponse.ok) {
            throw new Error('Failed to fetch invoice');
        }

        const invoices = await invoiceResponse.json();
        if (!invoices || invoices.length === 0) {
            throw new Error('Invoice not found');
        }

        const invoice = invoices[0];
        
        // Check if invoice is already paid
        if (invoice.status === 'paid') {
            throw new Error('Invoice is already paid');
        }

        // Check if invoice is valid for payment
        if (!['sent', 'viewed', 'overdue'].includes(invoice.status)) {
            throw new Error(`Invoice status '${invoice.status}' is not valid for payment`);
        }

        const amount = invoice.total_amount;
        const currency = invoice.currency?.toLowerCase() || 'bhd';
        
        console.log('Creating payment intent for invoice:', { amount, currency, invoiceNumber: invoice.invoice_number });

        // Prepare Stripe payment intent data
        const stripeParams = new URLSearchParams();
        stripeParams.append('amount', Math.round(amount * 100).toString()); // Convert to cents
        stripeParams.append('currency', currency);
        stripeParams.append('payment_method_types[]', 'card');
        stripeParams.append('metadata[invoice_id]', invoiceId);
        stripeParams.append('metadata[invoice_number]', invoice.invoice_number);
        stripeParams.append('metadata[customer_email]', customerEmail || invoice.customer?.email || '');
        stripeParams.append('metadata[customer_name]', invoice.customer?.full_name || '');
        stripeParams.append('description', `Payment for Invoice ${invoice.invoice_number}`);

        // Create payment intent with Stripe
        const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: stripeParams.toString()
        });

        if (!stripeResponse.ok) {
            const errorData = await stripeResponse.text();
            console.error('Stripe API error:', errorData);
            throw new Error(`Stripe API error: ${errorData}`);
        }

        const paymentIntent = await stripeResponse.json();
        console.log('Payment intent created:', paymentIntent.id);

        // Update invoice with Stripe payment intent ID
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/invoices?id=eq.${invoiceId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                stripe_payment_intent_id: paymentIntent.id,
                updated_at: new Date().toISOString()
            })
        });

        if (!updateResponse.ok) {
            console.error('Failed to update invoice with payment intent ID');
        }

        const result = {
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                invoiceId: invoiceId,
                invoiceNumber: invoice.invoice_number,
                amount: amount,
                currency: currency,
                status: 'pending'
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Invoice payment error:', error);

        const errorResponse = {
            error: {
                code: 'INVOICE_PAYMENT_FAILED',
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
