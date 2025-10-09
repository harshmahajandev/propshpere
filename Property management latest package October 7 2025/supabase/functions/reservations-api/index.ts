import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const action = pathSegments[pathSegments.length - 1]
    
    switch (req.method) {
      case 'GET':
        if (action === 'reservations-api') {
          // Get all reservations
          const { data: reservations, error } = await supabaseClient
            .from('reservations')
            .select(`
              *,
              properties(*),
              customers(
                *,
                users(email, first_name, last_name, phone)
              ),
              payments(*)
            `)
            .order('created_at', { ascending: false })
          
          if (error) throw error
          
          return new Response(JSON.stringify({ success: true, data: reservations }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          // Get single reservation
          const reservationId = pathSegments[pathSegments.length - 1]
          const { data: reservation, error } = await supabaseClient
            .from('reservations')
            .select(`
              *,
              properties(*),
              customers(
                *,
                users(email, first_name, last_name, phone)
              ),
              payments(*),
              invoices(*)
            `)
            .eq('id', reservationId)
            .single()
          
          if (error) throw error
          
          return new Response(JSON.stringify({ success: true, data: reservation }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      
      case 'POST':
        const reservationData = await req.json()
        
        // Generate unique reservation code
        const reservationCode = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
        
        const { data: newReservation, error: createError } = await supabaseClient
          .from('reservations')
          .insert({
            ...reservationData,
            reservation_code: reservationCode,
            status: 'pending',
            reservation_date: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          })
          .select()
          .single()
        
        if (createError) throw createError
        
        // Update property status if needed
        if (reservationData.property_id) {
          await supabaseClient
            .from('properties')
            .update({ status: 'reserved' })
            .eq('id', reservationData.property_id)
        }
        
        // Log activity
        await supabaseClient
          .from('activities')
          .insert({
            activity_type: 'reservation_created',
            entity_type: 'reservation',
            entity_id: newReservation.id,
            description: `New reservation created: ${reservationCode}`,
            metadata: { 
              property_id: reservationData.property_id,
              customer_id: reservationData.customer_id,
              amount: reservationData.deposit_amount
            }
          })
        
        return new Response(JSON.stringify({ success: true, data: newReservation }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      
      case 'PUT':
        const reservationId = pathSegments[pathSegments.length - 1]
        const updateData = await req.json()
        
        const { data: updatedReservation, error: updateError } = await supabaseClient
          .from('reservations')
          .update(updateData)
          .eq('id', reservationId)
          .select()
          .single()
        
        if (updateError) throw updateError
        
        // Update property status based on reservation status
        if (updateData.status === 'confirmed' && updatedReservation.property_id) {
          await supabaseClient
            .from('properties')
            .update({ status: 'sold' })
            .eq('id', updatedReservation.property_id)
        } else if (updateData.status === 'cancelled' && updatedReservation.property_id) {
          await supabaseClient
            .from('properties')
            .update({ status: 'available' })
            .eq('id', updatedReservation.property_id)
        }
        
        // Log activity
        await supabaseClient
          .from('activities')
          .insert({
            activity_type: 'reservation_updated',
            entity_type: 'reservation',
            entity_id: reservationId,
            description: `Reservation status changed to ${updateData.status}`,
            metadata: updateData
          })
        
        return new Response(JSON.stringify({ success: true, data: updatedReservation }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      
      default:
        throw new Error('Method not allowed')
    }

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: {
        code: 'RESERVATIONS_API_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})