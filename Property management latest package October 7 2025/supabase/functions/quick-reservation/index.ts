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
        const { propertyId, customerName, customerEmail, customerPhone, nationality, budgetRange, holdDays = 7 } = await req.json();

        if (!propertyId || !customerName || !customerEmail || !customerPhone) {
            throw new Error('Property ID, customer name, email, and phone are required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Calculate hold until date
        const holdUntil = new Date();
        holdUntil.setDate(holdUntil.getDate() + holdDays);

        // Create quick reservation
        const reservationData = {
            property_id: propertyId,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            nationality: nationality || null,
            budget_range: budgetRange || null,
            reservation_type: 'provisional',
            hold_until: holdUntil.toISOString().split('T')[0],
            deposit_amount: 5000.00 // Default deposit amount in BHD
        };

        const reservationResponse = await fetch(`${supabaseUrl}/rest/v1/quick_reservations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(reservationData)
        });

        if (!reservationResponse.ok) {
            const errorText = await reservationResponse.text();
            throw new Error(`Failed to create reservation: ${errorText}`);
        }

        const reservation = await reservationResponse.json();
        const reservationId = reservation[0].id;

        // Create lead in CRM system
        const leadData = {
            customer_name: customerName,
            email: customerEmail,
            phone: customerPhone,
            nationality: nationality || 'Unknown',
            budget_range: budgetRange || 'Not specified',
            source: 'Property Map Quick Reservation',
            status: 'new',
            priority: 'high',
            property_of_interest: propertyId,
            notes: `Quick reservation created. Hold until: ${holdUntil.toISOString().split('T')[0]}`,
            score: 75, // High score for quick reservations
            lead_type: 'hot'
        };

        const leadResponse = await fetch(`${supabaseUrl}/rest/v1/leads`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(leadData)
        });

        let leadId = null;
        if (leadResponse.ok) {
            const lead = await leadResponse.json();
            leadId = lead[0].id;

            // Update reservation with lead ID
            await fetch(`${supabaseUrl}/rest/v1/quick_reservations?id=eq.${reservationId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lead_id: leadId })
            });
        }

        // Update property status to reserved
        await fetch(`${supabaseUrl}/rest/v1/properties?id=eq.${propertyId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                status: 'reserved',
                updated_at: new Date().toISOString()
            })
        });

        // Create real Stripe payment intent
        let paymentLink = null;
        let stripePaymentIntentId = null;
        
        try {
            const paymentResponse = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reservationId,
                    amount: 5000.00, // BHD 5000 deposit
                    currency: 'bhd',
                    customerEmail: customerEmail,
                    customerName: customerName
                })
            });

            if (paymentResponse.ok) {
                const paymentData = await paymentResponse.json();
                if (paymentData.data) {
                    paymentLink = paymentData.data.paymentUrl;
                    stripePaymentIntentId = paymentData.data.paymentIntentId;
                }
            }
        } catch (error) {
            console.error('Payment creation failed:', error);
            // Continue with reservation even if payment fails
            paymentLink = `${supabaseUrl.replace('supabase.co', 'minimax.io')}/payment/${reservationId}`;
        }
        
        if (paymentLink) {
            await fetch(`${supabaseUrl}/rest/v1/quick_reservations?id=eq.${reservationId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    payment_link: paymentLink,
                    stripe_payment_intent_id: stripePaymentIntentId
                })
            });
        }

        return new Response(JSON.stringify({
            data: {
                reservationId,
                leadId,
                holdUntil: holdUntil.toISOString(),
                paymentLink,
                depositAmount: 5000.00,
                status: 'provisional'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Quick reservation error:', error);

        const errorResponse = {
            error: {
                code: 'RESERVATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});