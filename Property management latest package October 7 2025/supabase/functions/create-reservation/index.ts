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
        const {
            property_id,
            unit_id,
            customer_name,
            customer_email,
            customer_phone,
            customer_nationality,
            viewing_date,
            preferred_contact_time,
            budget_min,
            budget_max,
            financing_needed,
            special_requirements
        } = await req.json();

        // Validate required fields
        if (!property_id || !customer_name || !customer_email || !customer_phone) {
            throw new Error('Property ID, customer name, email, and phone are required');
        }

        // Get Supabase credentials
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Check property availability
        const propertyResponse = await fetch(`${supabaseUrl}/rest/v1/properties?id=eq.${property_id}&select=*`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!propertyResponse.ok) {
            throw new Error('Failed to fetch property details');
        }

        const properties = await propertyResponse.json();
        if (properties.length === 0) {
            throw new Error('Property not found');
        }

        const property = properties[0];
        if (property.status !== 'available') {
            throw new Error('Property is not available for reservation');
        }

        // If unit_id specified, check unit availability
        if (unit_id) {
            const unitResponse = await fetch(`${supabaseUrl}/rest/v1/property_units?id=eq.${unit_id}&property_id=eq.${property_id}&select=*`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!unitResponse.ok) {
                throw new Error('Failed to fetch unit details');
            }

            const units = await unitResponse.json();
            if (units.length === 0) {
                throw new Error('Unit not found');
            }

            const unit = units[0];
            if (unit.status !== 'available') {
                throw new Error('Selected unit is not available for reservation');
            }
        }

        // Get or create customer profile
        let customer_id = null;
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
                    customer_id = userData.id;
                }
            } catch (error) {
                console.log('Could not get user from token:', error.message);
            }
        }

        // Create reservation
        const reservationData = {
            property_id,
            unit_id: unit_id || null,
            customer_id: customer_id || null,
            customer_name,
            customer_email,
            customer_phone,
            customer_nationality: customer_nationality || null,
            status: 'pending',
            reservation_date: new Date().toISOString(),
            viewing_date: viewing_date ? new Date(viewing_date).toISOString() : null,
            preferred_contact_time: preferred_contact_time || null,
            budget_min: budget_min || null,
            budget_max: budget_max || null,
            financing_needed: financing_needed || false,
            special_requirements: special_requirements || null,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        };

        const reservationResponse = await fetch(`${supabaseUrl}/rest/v1/reservations`, {
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

        // Update property availability if needed
        if (property.available_units && property.available_units > 0) {
            await fetch(`${supabaseUrl}/rest/v1/properties?id=eq.${property_id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    available_units: property.available_units - 1,
                    updated_at: new Date().toISOString()
                })
            });
        }

        // Update unit status if specified
        if (unit_id) {
            await fetch(`${supabaseUrl}/rest/v1/property_units?id=eq.${unit_id}`, {
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
        }

        // Log activity
        await fetch(`${supabaseUrl}/rest/v1/activity_logs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                entity_type: 'reservation',
                entity_id: reservationId,
                activity_type: 'created',
                description: `Reservation created for ${customer_name}`,
                metadata: {
                    property_title: property.title,
                    customer_email,
                    customer_phone
                },
                performed_by: customer_id
            })
        });

        // Send notification (simplified - in production would use email service)
        await fetch(`${supabaseUrl}/rest/v1/notifications`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: customer_id || null,
                type: 'email',
                title: 'Reservation Confirmation',
                message: `Thank you ${customer_name}! Your reservation for ${property.title} has been received and is being processed.`,
                related_entity_type: 'reservation',
                related_entity_id: reservationId,
                status: 'pending'
            })
        });

        return new Response(JSON.stringify({
            data: {
                reservation_id: reservationId,
                status: 'pending',
                property_title: property.title,
                confirmation_number: `RES-${reservationId.split('-')[0].toUpperCase()}`,
                expires_at: reservationData.expires_at
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Reservation creation error:', error);

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