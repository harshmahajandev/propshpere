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

    const { action, lead_data, lead_id } = await req.json()

    switch (action) {
      case 'create_lead':
        // AI lead scoring algorithm
        const calculateLeadScore = (lead: any) => {
          let score = 0
          
          // Budget qualification (40 points)
          if (lead.budget_max > 150000) score += 40
          else if (lead.budget_max > 100000) score += 30
          else if (lead.budget_max > 50000) score += 20
          else score += 10
          
          // Contact information completeness (20 points)
          if (lead.phone && lead.email) score += 20
          else if (lead.phone || lead.email) score += 10
          
          // Buyer type (20 points)
          if (lead.buyer_type === 'cash_buyer') score += 20
          else if (lead.buyer_type === 'investor') score += 15
          else if (lead.buyer_type === 'first_time_buyer') score += 10
          else score += 5
          
          // Timeline urgency (20 points)
          if (lead.timeline === 'immediate') score += 20
          else if (lead.timeline === '3_months') score += 15
          else if (lead.timeline === '6_months') score += 10
          else score += 5
          
          return Math.min(score, 100)
        }
        
        const score = calculateLeadScore(lead_data)
        
        // Generate AI insights
        const generateInsights = (lead: any, score: number) => {
          const insights = []
          
          if (score >= 80) {
            insights.push('High-quality lead with strong purchase potential')
          } else if (score >= 60) {
            insights.push('Qualified lead worth pursuing')
          } else {
            insights.push('Lead needs nurturing and qualification')
          }
          
          if (lead.budget_max > 200000) {
            insights.push('Premium budget range - consider luxury properties')
          }
          
          if (lead.buyer_type === 'investor') {
            insights.push('Investor profile - focus on ROI and rental potential')
          }
          
          if (lead.timeline === 'immediate') {
            insights.push('Urgent timeline - prioritize immediate follow-up')
          }
          
          return {
            score,
            priority: score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low',
            insights,
            next_actions: [
              'Schedule qualification call',
              'Send property recommendations',
              'Arrange site visit'
            ]
          }
        }
        
        const aiInsights = generateInsights(lead_data, score)
        
        const { data: newLead, error: leadError } = await supabaseClient
          .from('leads')
          .insert({
            ...lead_data,
            score,
            ai_insights: aiInsights,
            status: 'new'
          })
          .select()
          .single()
        
        if (leadError) throw leadError
        
        // Log activity
        await supabaseClient
          .from('activities')
          .insert({
            user_id: lead_data.assigned_to,
            activity_type: 'lead_created',
            entity_type: 'lead',
            entity_id: newLead.id,
            description: `New lead created: ${lead_data.first_name} ${lead_data.last_name}`,
            metadata: { score, source: lead_data.source }
          })
        
        return new Response(JSON.stringify({ 
          success: true, 
          lead: newLead,
          ai_insights: aiInsights
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      
      case 'update_lead_status':
        const { data: updatedLead, error: updateError } = await supabaseClient
          .from('leads')
          .update({ status: lead_data.status })
          .eq('id', lead_id)
          .select()
          .single()
        
        if (updateError) throw updateError
        
        // Log status change
        await supabaseClient
          .from('activities')
          .insert({
            activity_type: 'status_change',
            entity_type: 'lead',
            entity_id: lead_id,
            description: `Lead status changed to ${lead_data.status}`,
            metadata: { previous_status: lead_data.previous_status, new_status: lead_data.status }
          })
        
        return new Response(JSON.stringify({ 
          success: true, 
          lead: updatedLead
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      
      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: {
        code: 'LEAD_MANAGEMENT_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})