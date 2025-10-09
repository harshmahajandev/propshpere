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
        if (action === 'customers-api') {
          // Get all customers with related data
          const { data: customers, error } = await supabaseClient
            .from('customers')
            .select(`
              *,
              users!customers_user_id_fkey(email, first_name, last_name, phone),
              reservations(*),
              customer_preferences(*),
              property_recommendations(
                *,
                properties(*)
              )
            `)
            .order('created_at', { ascending: false })
          
          if (error) throw error
          
          return new Response(JSON.stringify({ success: true, data: customers }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          // Get single customer
          const customerId = pathSegments[pathSegments.length - 1]
          const { data: customer, error } = await supabaseClient
            .from('customers')
            .select(`
              *,
              users!customers_user_id_fkey(email, first_name, last_name, phone),
              reservations(*),
              customer_preferences(*),
              property_recommendations(
                *,
                properties(*)
              ),
              documents(*),
              payments(*)
            `)
            .eq('id', customerId)
            .single()
          
          if (error) throw error
          
          return new Response(JSON.stringify({ success: true, data: customer }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      
      case 'POST':
        const newCustomerData = await req.json()
        
        // Create user account first if email provided
        let userId = null
        if (newCustomerData.email) {
          const { data: newUser, error: userError } = await supabaseClient
            .from('users')
            .insert({
              email: newCustomerData.email,
              first_name: newCustomerData.first_name,
              last_name: newCustomerData.last_name,
              phone: newCustomerData.phone,
              role: 'customer'
            })
            .select()
            .single()
          
          if (userError) throw userError
          userId = newUser.id
        }
        
        const { data: newCustomer, error: createError } = await supabaseClient
          .from('customers')
          .insert({
            ...newCustomerData,
            user_id: userId
          })
          .select()
          .single()
        
        if (createError) throw createError
        
        // Log activity
        await supabaseClient
          .from('activities')
          .insert({
            activity_type: 'customer_created',
            entity_type: 'customer',
            entity_id: newCustomer.id,
            description: `New customer created: ${newCustomerData.first_name} ${newCustomerData.last_name}`,
            metadata: { nationality: newCustomer.nationality, customer_type: newCustomer.customer_type }
          })
        
        return new Response(JSON.stringify({ success: true, data: newCustomer }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      
      case 'PUT':
        const customerId = pathSegments[pathSegments.length - 1]
        const updateData = await req.json()
        
        const { data: updatedCustomer, error: updateError } = await supabaseClient
          .from('customers')
          .update(updateData)
          .eq('id', customerId)
          .select()
          .single()
        
        if (updateError) throw updateError
        
        // Log activity
        await supabaseClient
          .from('activities')
          .insert({
            activity_type: 'customer_updated',
            entity_type: 'customer',
            entity_id: customerId,
            description: `Customer profile updated`,
            metadata: updateData
          })
        
        return new Response(JSON.stringify({ success: true, data: updatedCustomer }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      
      default:
        throw new Error('Method not allowed')
    }

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: {
        code: 'CUSTOMERS_API_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})