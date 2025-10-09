import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

interface StripePaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  client_secret: string
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
    
    // Stripe API simulation for demo purposes
    const createPaymentIntent = async (amount: number, currency: string): Promise<StripePaymentIntent> => {
      // In production, this would call actual Stripe API
      return {
        id: `pi_${Math.random().toString(36).substr(2, 24)}`,
        amount: amount * 100, // Stripe uses cents
        currency: currency.toLowerCase(),
        status: 'requires_payment_method',
        client_secret: `pi_${Math.random().toString(36).substr(2, 24)}_secret_${Math.random().toString(36).substr(2, 16)}`
      }
    }

    const confirmPayment = async (paymentIntentId: string): Promise<StripePaymentIntent> => {
      // In production, this would confirm with Stripe
      return {
        id: paymentIntentId,
        amount: 0,
        currency: 'bhd',
        status: 'succeeded',
        client_secret: ''
      }
    }
    
    switch (req.method) {
      case 'GET':
        if (action === 'payments-api') {
          // Get all payments
          const { data: payments, error } = await supabaseClient
            .from('payments')
            .select(`
              *,
              customers(
                *,
                users(first_name, last_name, email)
              ),
              invoices(*)
            `)
            .order('created_at', { ascending: false })
          
          if (error) throw error
          
          return new Response(JSON.stringify({ success: true, data: payments }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          // Get single payment
          const paymentId = pathSegments[pathSegments.length - 1]
          const { data: payment, error } = await supabaseClient
            .from('payments')
            .select(`
              *,
              customers(
                *,
                users(first_name, last_name, email)
              ),
              invoices(*)
            `)
            .eq('id', paymentId)
            .single()
          
          if (error) throw error
          
          return new Response(JSON.stringify({ success: true, data: payment }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      
      case 'POST':
        const requestData = await req.json()
        const { action: paymentAction, ...paymentData } = requestData
        
        switch (paymentAction) {
          case 'create_payment_intent':
            // Create Stripe payment intent
            const paymentIntent = await createPaymentIntent(
              paymentData.amount,
              paymentData.currency || 'BHD'
            )
            
            // Store payment record
            const { data: newPayment, error: createError } = await supabaseClient
              .from('payments')
              .insert({
                invoice_id: paymentData.invoice_id,
                customer_id: paymentData.customer_id,
                amount: paymentData.amount,
                currency: paymentData.currency || 'BHD',
                payment_method: paymentData.payment_method || 'card',
                payment_reference: paymentIntent.id,
                payment_date: new Date().toISOString(),
                status: 'pending'
              })
              .select()
              .single()
            
            if (createError) throw createError
            
            return new Response(JSON.stringify({ 
              success: true, 
              data: {
                payment: newPayment,
                client_secret: paymentIntent.client_secret,
                payment_intent_id: paymentIntent.id
              }
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          
          case 'confirm_payment':
            // Confirm payment with Stripe
            const confirmedPayment = await confirmPayment(paymentData.payment_intent_id)
            
            if (confirmedPayment.status === 'succeeded') {
              // Update payment record
              const { data: updatedPayment, error: updateError } = await supabaseClient
                .from('payments')
                .update({
                  status: 'completed',
                  payment_date: new Date().toISOString()
                })
                .eq('payment_reference', paymentData.payment_intent_id)
                .select()
                .single()
              
              if (updateError) throw updateError
              
              // Update invoice status
              if (updatedPayment.invoice_id) {
                await supabaseClient
                  .from('invoices')
                  .update({ status: 'paid', payment_date: new Date().toISOString() })
                  .eq('id', updatedPayment.invoice_id)
              }
              
              // Log activity
              await supabaseClient
                .from('activities')
                .insert({
                  activity_type: 'payment_completed',
                  entity_type: 'payment',
                  entity_id: updatedPayment.id,
                  description: `Payment completed: BHD ${updatedPayment.amount}`,
                  metadata: { 
                    amount: updatedPayment.amount,
                    currency: updatedPayment.currency,
                    method: updatedPayment.payment_method
                  }
                })
              
              return new Response(JSON.stringify({ 
                success: true, 
                data: updatedPayment
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              })
            } else {
              throw new Error('Payment confirmation failed')
            }
          
          case 'process_installment':
            // Process installment payment
            const installmentIntent = await createPaymentIntent(
              paymentData.installment_amount,
              paymentData.currency || 'BHD'
            )
            
            // Create installment payment record
            const { data: installmentPayment, error: installmentError } = await supabaseClient
              .from('payments')
              .insert({
                customer_id: paymentData.customer_id,
                amount: paymentData.installment_amount,
                currency: paymentData.currency || 'BHD',
                payment_method: paymentData.payment_method || 'card',
                payment_reference: installmentIntent.id,
                payment_date: new Date().toISOString(),
                status: 'pending',
                notes: `Installment payment ${paymentData.installment_number} of ${paymentData.total_installments}`
              })
              .select()
              .single()
            
            if (installmentError) throw installmentError
            
            return new Response(JSON.stringify({ 
              success: true, 
              data: {
                payment: installmentPayment,
                client_secret: installmentIntent.client_secret,
                payment_intent_id: installmentIntent.id
              }
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          
          default:
            throw new Error('Invalid payment action')
        }
      
      case 'PUT':
        const paymentId = pathSegments[pathSegments.length - 1]
        const updateData = await req.json()
        
        const { data: updatedPayment, error: updateError } = await supabaseClient
          .from('payments')
          .update(updateData)
          .eq('id', paymentId)
          .select()
          .single()
        
        if (updateError) throw updateError
        
        return new Response(JSON.stringify({ success: true, data: updatedPayment }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      
      default:
        throw new Error('Method not allowed')
    }

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: {
        code: 'PAYMENTS_API_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})