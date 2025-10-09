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
        const { property_id, unit_id, check_date } = await req.json();

        if (!property_id) {
            throw new Error('Property ID is required');
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
        let availabilityInfo = {
            property_available: property.status === 'available',
            property_status: property.status,
            total_units: property.total_units || 1,
            available_units: property.available_units || (property.status === 'available' ? 1 : 0),
            units: []
        };

        // If specific unit requested, check unit availability
        if (unit_id) {
            const unitResponse = await fetch(`${supabaseUrl}/rest/v1/property_units?property_id=eq.${property_id}&id=eq.${unit_id}&select=*`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (unitResponse.ok) {
                const units = await unitResponse.json();
                if (units.length > 0) {
                    const unit = units[0];
                    availabilityInfo.units = [{
                        unit_id: unit.id,
                        unit_number: unit.unit_number,
                        floor_number: unit.floor_number,
                        unit_type: unit.unit_type,
                        size: unit.size,
                        bedrooms: unit.bedrooms,
                        bathrooms: unit.bathrooms,
                        price: unit.price,
                        status: unit.status,
                        available: unit.status === 'available'
                    }];
                } else {
                    throw new Error('Unit not found');
                }
            }
        } else {
            // Get all units for this property
            const allUnitsResponse = await fetch(`${supabaseUrl}/rest/v1/property_units?property_id=eq.${property_id}&select=*&order=unit_number`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (allUnitsResponse.ok) {
                const allUnits = await allUnitsResponse.json();
                availabilityInfo.units = allUnits.map(unit => ({
                    unit_id: unit.id,
                    unit_number: unit.unit_number,
                    floor_number: unit.floor_number,
                    unit_type: unit.unit_type,
                    size: unit.size,
                    bedrooms: unit.bedrooms,
                    bathrooms: unit.bathrooms,
                    price: unit.price,
                    status: unit.status,
                    available: unit.status === 'available'
                }));
                
                // Update available units count
                const availableUnitsCount = allUnits.filter(unit => unit.status === 'available').length;
                availabilityInfo.available_units = availableUnitsCount;
            }
        }

        // Check existing reservations for the date range if check_date provided
        if (check_date) {
            const checkDateTime = new Date(check_date);
            const startDate = new Date(checkDateTime.getTime() - 24 * 60 * 60 * 1000); // 1 day before
            const endDate = new Date(checkDateTime.getTime() + 24 * 60 * 60 * 1000); // 1 day after

            let reservationQuery = `property_id=eq.${property_id}&status=in.(pending,confirmed)&viewing_date=gte.${startDate.toISOString()}&viewing_date=lte.${endDate.toISOString()}`;
            
            if (unit_id) {
                reservationQuery += `&unit_id=eq.${unit_id}`;
            }

            const reservationsResponse = await fetch(`${supabaseUrl}/rest/v1/reservations?${reservationQuery}&select=*`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (reservationsResponse.ok) {
                const reservations = await reservationsResponse.json();
                availabilityInfo.conflicting_reservations = reservations.length;
                availabilityInfo.has_conflicts = reservations.length > 0;
            }
        }

        // Calculate property score based on availability and demand
        const totalReservationsResponse = await fetch(`${supabaseUrl}/rest/v1/reservations?property_id=eq.${property_id}&select=count`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'count=exact'
            }
        });

        let demandScore = 0;
        if (totalReservationsResponse.ok) {
            const countHeader = totalReservationsResponse.headers.get('content-range');
            if (countHeader) {
                const totalReservations = parseInt(countHeader.split('/')[1] || '0');
                demandScore = Math.min(totalReservations * 10, 100); // Max score of 100
            }
        }

        availabilityInfo.demand_score = demandScore;
        availabilityInfo.last_checked = new Date().toISOString();

        return new Response(JSON.stringify({
            data: availabilityInfo
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Availability check error:', error);

        const errorResponse = {
            error: {
                code: 'AVAILABILITY_CHECK_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});