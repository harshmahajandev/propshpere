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

    const { customer_id, preferences } = await req.json()

    // AI-powered property matching algorithm
    const calculateMatchScore = (property: any, prefs: any) => {
      let score = 0
      let maxScore = 0

      // Budget matching (40% weight)
      maxScore += 40
      if (property.price >= (prefs.budget_min || 0) && property.price <= (prefs.budget_max || 1000000)) {
        score += 40
      } else if (property.price <= (prefs.budget_max || 1000000) * 1.1) {
        score += 30 // Slightly over budget
      }

      // Bedroom matching (25% weight)
      maxScore += 25
      if (property.bedrooms >= (prefs.min_bedrooms || 1) && property.bedrooms <= (prefs.max_bedrooms || 10)) {
        score += 25
      } else if (Math.abs(property.bedrooms - (prefs.min_bedrooms || 3)) <= 1) {
        score += 15 // Close match
      }

      // Location matching (20% weight)
      maxScore += 20
      if (prefs.preferred_locations && prefs.preferred_locations.includes(property.project)) {
        score += 20
      }

      // Amenity matching (15% weight)
      maxScore += 15
      if (property.amenities && prefs.amenity_preferences) {
        const matchingAmenities = property.amenities.filter((a: string) => 
          prefs.amenity_preferences.includes(a)
        )
        score += (matchingAmenities.length / Math.max(prefs.amenity_preferences.length, 1)) * 15
      }

      return Math.round((score / maxScore) * 100)
    }

    // Get available properties
    const { data: properties, error: propertiesError } = await supabaseClient
      .from('properties')
      .select('*')
      .eq('status', 'available')

    if (propertiesError) throw propertiesError

    // Calculate match scores and generate recommendations
    const recommendations = properties.map(property => {
      const matchScore = calculateMatchScore(property, preferences)
      
      let recommendationReason = []
      
      // Generate personalized recommendation reasons
      if (property.price <= preferences.budget_max) {
        recommendationReason.push('Within your budget range')
      }
      
      if (property.bedrooms === preferences.min_bedrooms) {
        recommendationReason.push(`Perfect ${property.bedrooms}BR match for your family`)
      }
      
      if (preferences.preferred_locations?.includes(property.project)) {
        recommendationReason.push('In your preferred location')
      }
      
      if (property.amenities?.includes('Private Garden') && preferences.lifestyle_preferences?.garden) {
        recommendationReason.push('Beautiful private garden space')
      }
      
      if (property.amenities?.includes('Swimming Pool Access')) {
        recommendationReason.push('Swimming pool access')
      }

      return {
        property_id: property.id,
        customer_id,
        match_score: matchScore,
        compatibility_factors: {
          budget_match: property.price <= preferences.budget_max,
          bedroom_match: property.bedrooms >= preferences.min_bedrooms && property.bedrooms <= preferences.max_bedrooms,
          location_match: preferences.preferred_locations?.includes(property.project),
          amenity_matches: property.amenities?.filter((a: string) => preferences.amenity_preferences?.includes(a)) || []
        },
        recommendation_reason: recommendationReason.join(' • '),
        property
      }
    })
    .filter(rec => rec.match_score >= 50) // Only show 50%+ matches
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 10) // Top 10 recommendations

    // Store recommendations in database
    for (const rec of recommendations) {
      await supabaseClient
        .from('property_recommendations')
        .upsert({
          customer_id: rec.customer_id,
          property_id: rec.property_id,
          match_score: rec.match_score,
          compatibility_factors: rec.compatibility_factors,
          recommendation_reason: rec.recommendation_reason,
          status: 'active'
        }, {
          onConflict: 'customer_id,property_id'
        })
    }

    return new Response(JSON.stringify({ 
      success: true,
      recommendations: recommendations.map(r => ({
        ...r.property,
        match_score: r.match_score,
        recommendation_reason: r.recommendation_reason,
        compatibility_factors: r.compatibility_factors
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: {
        code: 'RECOMMENDATION_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})