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
        const { amount, currency = 'bhd', customerEmail, description, metadata = {} } = await req.json();

        console.log('Payment intent request received:', { amount, currency, customerEmail, description });

        // Validate required parameters
        if (!amount || amount <= 0) {
            throw new Error('Valid amount is required');
        }

        if (!customerEmail) {
            throw new Error('Customer email is required');
        }

        // Get environment variables
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!stripeSecretKey || stripeSecretKey === 'Important' || stripeSecretKey.length < 10) {
            console.log('Stripe secret key not properly configured, entering test mode');
            // Return a test mode response when Stripe keys are not available
            const testPaymentIntent = {
                id: `pi_test_${Date.now()}`,
                client_secret: `pi_test_${Date.now()}_secret_test`,
                status: 'requires_payment_method',
                amount: Math.round(amount * 100),
                currency: currency.toLowerCase()
            };

            // Note: In test mode, no database updates needed as this is handled in frontend

            return new Response(JSON.stringify({
                data: {
                    clientSecret: testPaymentIntent.client_secret,
                    paymentIntentId: testPaymentIntent.id,
                    paymentUrl: `#test-mode-payment-${testPaymentIntent.id}`,
                    amount: amount,
                    currency: currency,
                    status: 'test_mode',
                    message: 'Test mode: Stripe credentials not configured. This would create a real payment intent in production.'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        console.log('Environment variables validated, creating payment intent...');

        // Get user from auth header if provided
        let userId = null;
        const authHeader = req.headers.get('authorization');
        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'apikey': serviceRoleKey
                    }
                });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    userId = userData.id;
                    console.log('User identified:', userId);
                }
            } catch (error) {
                console.log('Could not get user from token:', error.message);
            }
        }

        // Prepare Stripe payment intent data
        const stripeParams = new URLSearchParams();
        stripeParams.append('amount', Math.round(amount * 100).toString()); // Convert to fils (BHD cents)
        stripeParams.append('currency', currency.toLowerCase());
        stripeParams.append('payment_method_types[]', 'card');
        stripeParams.append('metadata[customer_email]', customerEmail);
        stripeParams.append('metadata[user_id]', userId || '');
        stripeParams.append('metadata[purpose]', 'property_reservation_deposit');
        if (description) {
            stripeParams.append('description', description);
        }
        
        // Add custom metadata
        Object.entries(metadata).forEach(([key, value]) => {
            stripeParams.append(`metadata[${key}]`, String(value));
        });

        // Create payment intent with Stripe
        let paymentIntent;
        try {
            const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${stripeSecretKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: stripeParams.toString()
            });

            console.log('Stripe API response status:', stripeResponse.status);

            if (!stripeResponse.ok) {
                const errorData = await stripeResponse.text();
                console.error('Stripe API error, falling back to test mode:', errorData);
                
                // Fall back to test mode if Stripe fails
                const testPaymentIntent = {
                    id: `pi_test_${Date.now()}`,
                    client_secret: `pi_test_${Date.now()}_secret_test`,
                    status: 'requires_payment_method',
                    amount: Math.round(amount * 100),
                    currency: currency.toLowerCase()
                };

                return new Response(JSON.stringify({
                    data: {
                        clientSecret: testPaymentIntent.client_secret,
                        paymentIntentId: testPaymentIntent.id,
                        paymentUrl: `#test-mode-payment-${testPaymentIntent.id}`,
                        amount: amount,
                        currency: currency,
                        status: 'test_mode',
                        message: 'Test mode: Stripe API error, using test payment intent'
                    }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            paymentIntent = await stripeResponse.json();
            console.log('Payment intent created successfully:', paymentIntent.id);
        } catch (error) {
            console.error('Stripe API call failed, falling back to test mode:', error.message);
            
            // Fall back to test mode on any Stripe error
            const testPaymentIntent = {
                id: `pi_test_${Date.now()}`,
                client_secret: `pi_test_${Date.now()}_secret_test`,
                status: 'requires_payment_method',
                amount: Math.round(amount * 100),
                currency: currency.toLowerCase()
            };

            return new Response(JSON.stringify({
                data: {
                    clientSecret: testPaymentIntent.client_secret,
                    paymentIntentId: testPaymentIntent.id,
                    paymentUrl: `#test-mode-payment-${testPaymentIntent.id}`,
                    amount: amount,
                    currency: currency,
                    status: 'test_mode',
                    message: 'Test mode: Stripe unavailable, using test payment intent'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Note: Reservation creation and updates are handled in the frontend after payment completion

        const result = {
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                paymentUrl: `https://checkout.stripe.com/pay/${paymentIntent.client_secret}`,
                amount: amount,
                currency: currency,
                status: 'requires_payment_method'
            }
        };

        console.log('Payment intent creation completed successfully');

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Payment intent creation error:', error);

        const errorResponse = {
            error: {
                code: 'PAYMENT_INTENT_FAILED',
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