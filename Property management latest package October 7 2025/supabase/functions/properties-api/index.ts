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
        if (action === 'properties-api') {
          // Get all properties with filters
          const { data: properties, error } = await supabaseClient
            .from('properties')
            .select(`
              *,
              property_units(*),
              reservations(*)
            `)
            .order('created_at', { ascending: false })
          
          if (error) throw error
          
          return new Response(JSON.stringify({ success: true, data: properties }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          // Get single property
          const propertyId = pathSegments[pathSegments.length - 1]
          const { data: property, error } = await supabaseClient
            .from('properties')
            .select(`
              *,
              property_units(*),
              reservations(*),
              documents(*)
            `)
            .eq('id', propertyId)
            .single()
          
          if (error) throw error
          
          return new Response(JSON.stringify({ success: true, data: property }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      
      case 'POST':
        const newPropertyData = await req.json()
        
        const { data: newProperty, error: createError } = await supabaseClient
          .from('properties')
          .insert(newPropertyData)
          .select()
          .single()
        
        if (createError) throw createError
        
        // Log activity
        await supabaseClient
          .from('activities')
          .insert({
            activity_type: 'property_created',
            entity_type: 'property',
            entity_id: newProperty.id,
            description: `New property created: ${newProperty.title}`,
            metadata: { project: newProperty.project, type: newProperty.type }
          })
        
        return new Response(JSON.stringify({ success: true, data: newProperty }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      
      case 'PUT':
        const propertyId = pathSegments[pathSegments.length - 1]
        const updateData = await req.json()
        
        const { data: updatedProperty, error: updateError } = await supabaseClient
          .from('properties')
          .update(updateData)
          .eq('id', propertyId)
          .select()
          .single()
        
        if (updateError) throw updateError
        
        // Log activity
        await supabaseClient
          .from('activities')
          .insert({
            activity_type: 'property_updated',
            entity_type: 'property',
            entity_id: propertyId,
            description: `Property updated: ${updatedProperty.title}`,
            metadata: updateData
          })
        
        return new Response(JSON.stringify({ success: true, data: updatedProperty }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      
      case 'DELETE':
        const deletePropertyId = pathSegments[pathSegments.length - 1]
        
        const { error: deleteError } = await supabaseClient
          .from('properties')
          .delete()
          .eq('id', deletePropertyId)
        
        if (deleteError) throw deleteError
        
        return new Response(JSON.stringify({ success: true, message: 'Property deleted' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      
      default:
        throw new Error('Method not allowed')
    }

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: {
        code: 'PROPERTIES_API_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})