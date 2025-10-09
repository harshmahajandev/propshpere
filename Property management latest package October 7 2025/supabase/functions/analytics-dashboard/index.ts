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

    const { dashboard_type, date_range } = await req.json()

    const analytics = {
      property_analytics: {},
      sales_analytics: {},
      financial_analytics: {},
      customer_analytics: {}
    }

    // Property Analytics
    const { data: properties } = await supabaseClient
      .from('properties')
      .select('*')
    
    const { data: reservations } = await supabaseClient
      .from('reservations')
      .select('*')
    
    const { data: leads } = await supabaseClient
      .from('leads')
      .select('*')
    
    const { data: payments } = await supabaseClient
      .from('payments')
      .select('*')

    // Calculate property metrics
    analytics.property_analytics = {
      total_properties: properties?.length || 0,
      available_properties: properties?.filter(p => p.status === 'available').length || 0,
      sold_properties: properties?.filter(p => p.status === 'sold').length || 0,
      reserved_properties: properties?.filter(p => p.status === 'reserved').length || 0,
      occupancy_rate: properties?.length ? 
        ((properties.filter(p => p.status === 'sold').length / properties.length) * 100).toFixed(1) : 0,
      
      by_project: properties?.reduce((acc: any, prop: any) => {
        acc[prop.project] = (acc[prop.project] || 0) + 1
        return acc
      }, {}) || {},
      
      by_bedrooms: properties?.reduce((acc: any, prop: any) => {
        const key = `${prop.bedrooms}BR`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {}) || {},
      
      average_price: properties?.length ? 
        (properties.reduce((sum: number, p: any) => sum + (p.price || 0), 0) / properties.length).toFixed(0) : 0
    }

    // Sales Analytics
    const totalRevenue = payments?.reduce((sum: number, p: any) => 
      sum + (p.status === 'completed' ? (p.amount || 0) : 0), 0) || 0
    
    analytics.sales_analytics = {
      total_leads: leads?.length || 0,
      qualified_leads: leads?.filter(l => l.score >= 60).length || 0,
      conversion_rate: leads?.length ? 
        ((reservations?.length || 0) / leads.length * 100).toFixed(1) : 0,
      
      leads_by_source: leads?.reduce((acc: any, lead: any) => {
        acc[lead.source || 'unknown'] = (acc[lead.source || 'unknown'] || 0) + 1
        return acc
      }, {}) || {},
      
      leads_by_status: leads?.reduce((acc: any, lead: any) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1
        return acc
      }, {}) || {},
      
      pipeline_value: reservations?.reduce((sum: number, r: any) => 
        sum + ((r.budget_max || 0) + (r.budget_min || 0)) / 2, 0) || 0
    }

    // Financial Analytics
    analytics.financial_analytics = {
      total_revenue: totalRevenue,
      pending_payments: payments?.filter(p => p.status === 'pending').length || 0,
      completed_payments: payments?.filter(p => p.status === 'completed').length || 0,
      
      revenue_by_month: payments?.reduce((acc: any, payment: any) => {
        const month = new Date(payment.payment_date).toISOString().slice(0, 7)
        acc[month] = (acc[month] || 0) + (payment.amount || 0)
        return acc
      }, {}) || {},
      
      average_deal_size: reservations?.length ? 
        (totalRevenue / reservations.length).toFixed(0) : 0
    }

    // Customer Analytics
    const { data: customers } = await supabaseClient
      .from('customers')
      .select('*')
    
    analytics.customer_analytics = {
      total_customers: customers?.length || 0,
      customers_by_nationality: customers?.reduce((acc: any, customer: any) => {
        acc[customer.nationality || 'unknown'] = (acc[customer.nationality || 'unknown'] || 0) + 1
        return acc
      }, {}) || {},
      
      customers_by_type: customers?.reduce((acc: any, customer: any) => {
        acc[customer.customer_type || 'individual'] = (acc[customer.customer_type || 'individual'] || 0) + 1
        return acc
      }, {}) || {},
      
      repeat_customers: customers?.filter(c => c.conversion_date).length || 0
    }

    return new Response(JSON.stringify({ 
      success: true,
      analytics,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: {
        code: 'ANALYTICS_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})