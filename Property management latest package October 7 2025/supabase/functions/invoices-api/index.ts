Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase configuration')
    }

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const action = pathSegments[pathSegments.length - 1]
    
    switch (req.method) {
      case 'GET':
        if (action === 'invoices-api') {
          // Get all invoices
          const response = await fetch(`${supabaseUrl}/rest/v1/invoices?select=*,customer:profiles!customer_id(full_name,email,phone),property:properties!property_id(*),booking:bookings!booking_id(*),payments(*)&order=created_at.desc`, {
            headers: {
              'apikey': supabaseServiceRoleKey,
              'Authorization': `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json'
            }
          })
          const invoices = await response.json()
          
          return new Response(JSON.stringify({ success: true, data: invoices }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else if (action === 'milestones') {
          // Get milestones for property type
          const propertyType = url.searchParams.get('property_type') || 'villa'
          const response = await fetch(`${supabaseUrl}/rest/v1/milestones?select=*&property_type=eq.${propertyType}&is_active=eq.true&order=milestone_order.asc`, {
            headers: {
              'apikey': supabaseServiceRoleKey,
              'Authorization': `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json'
            }
          })
          const milestones = await response.json()
          
          return new Response(JSON.stringify({ success: true, data: milestones }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else if (action === 'bookings') {
          // Get bookings for a customer
          const customerId = url.searchParams.get('customer_id')
          const response = await fetch(`${supabaseUrl}/rest/v1/bookings?select=*,customer:profiles!customer_id(full_name,email),property:properties!property_id(*)${customerId ? `&customer_id=eq.${customerId}` : ''}&order=created_at.desc`, {
            headers: {
              'apikey': supabaseServiceRoleKey,
              'Authorization': `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json'
            }
          })
          const bookings = await response.json()
          
          return new Response(JSON.stringify({ success: true, data: bookings }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else if (action === 'customers') {
          // Get all customers for dropdown
          const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id,full_name,email,phone&order=full_name.asc`, {
            headers: {
              'apikey': supabaseServiceRoleKey,
              'Authorization': `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json'
            }
          })
          const customers = await response.json()
          
          return new Response(JSON.stringify({ success: true, data: customers }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          // Get single invoice
          const invoiceId = pathSegments[pathSegments.length - 1]
          const response = await fetch(`${supabaseUrl}/rest/v1/invoices?select=*,customer:profiles!customer_id(full_name,email,phone),property:properties!property_id(*),booking:bookings!booking_id(*),payments(*)&id=eq.${invoiceId}`, {
            headers: {
              'apikey': supabaseServiceRoleKey,
              'Authorization': `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json'
            }
          })
          const data = await response.json()
          const invoice = data[0] || null
          
          return new Response(JSON.stringify({ success: true, data: invoice }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      
      case 'POST':
        const requestData = await req.json()
        
        if (action === 'generate-milestone-invoice') {
          // Generate milestone-based invoice
          const { booking_id, milestone_name, custom_amount, due_date, notes } = requestData
          
          // Get booking details with related data
          const bookingResponse = await fetch(`${supabaseUrl}/rest/v1/bookings?select=*,customer:profiles!customer_id(full_name,email),property:properties!property_id(*)&id=eq.${booking_id}`, {
            headers: {
              'apikey': supabaseServiceRoleKey,
              'Authorization': `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json'
            }
          })
          const bookingData = await bookingResponse.json()
          const booking = bookingData[0]
          
          if (!booking) {
            throw new Error('Booking not found')
          }
          
          // Get milestone details
          const milestoneResponse = await fetch(`${supabaseUrl}/rest/v1/milestones?select=*&property_type=eq.${booking.property.property_type}&milestone_name=eq.${milestone_name}`, {
            headers: {
              'apikey': supabaseServiceRoleKey,
              'Authorization': `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json'
            }
          })
          const milestoneData = await milestoneResponse.json()
          const milestone = milestoneData[0]
          
          if (!milestone) {
            throw new Error(`Milestone '${milestone_name}' not found for property type '${booking.property.property_type}'`)
          }
          
          // Calculate invoice amount
          const invoiceAmount = custom_amount || (booking.total_price * milestone.percentage / 100)
          const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
          
          // Create invoice
          const invoicePayload = {
            invoice_number: invoiceNumber,
            customer_id: booking.customer_id,
            property_id: booking.property_id,
            booking_id: booking.id,
            milestone_name: milestone.milestone_name,
            milestone_percentage: milestone.percentage,
            amount: invoiceAmount,
            total_amount: invoiceAmount,
            currency: 'BHD',
            status: 'sent',
            due_date: due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            items: JSON.stringify([{
              description: `${milestone.milestone_name} - ${booking.property.title}`,
              quantity: 1,
              unit_price: invoiceAmount,
              amount: invoiceAmount
            }]),
            notes: notes || milestone.description
          }
          
          const createResponse = await fetch(`${supabaseUrl}/rest/v1/invoices`, {
            method: 'POST',
            headers: {
              'apikey': supabaseServiceRoleKey,
              'Authorization': `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(invoicePayload)
          })
          const newInvoice = await createResponse.json()
          
          if (!createResponse.ok) {
            throw new Error(`Failed to create invoice: ${JSON.stringify(newInvoice)}`)
          }
          
          return new Response(JSON.stringify({ success: true, data: newInvoice[0] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else if (action === 'mark-paid') {
          // Mark invoice as paid
          const { invoice_id } = requestData
          
          if (!invoice_id) {
            throw new Error('Invoice ID is required')
          }
          
          // Get invoice details first
          const invoiceResponse = await fetch(`${supabaseUrl}/rest/v1/invoices?select=*,customer:profiles!customer_id(full_name,email),property:properties!property_id(*)&id=eq.${invoice_id}`, {
            headers: {
              'apikey': supabaseServiceRoleKey,
              'Authorization': `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json'
            }
          })
          const invoiceData = await invoiceResponse.json()
          const invoice = invoiceData[0]
          
          if (!invoice) {
            throw new Error('Invoice not found')
          }
          
          if (invoice.status === 'paid') {
            throw new Error('Invoice is already marked as paid')
          }
          
          // Update invoice status to paid
          const updateResponse = await fetch(`${supabaseUrl}/rest/v1/invoices?id=eq.${invoice_id}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseServiceRoleKey,
              'Authorization': `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              status: 'paid',
              payment_date: new Date().toISOString()
            })
          })
          const updatedInvoice = await updateResponse.json()
          
          if (!updateResponse.ok) {
            throw new Error(`Failed to update invoice: ${JSON.stringify(updatedInvoice)}`)
          }
          
          // Create payment record
          const paymentPayload = {
            invoice_id: invoice_id,
            customer_id: invoice.customer_id,
            amount: invoice.total_amount,
            currency: invoice.currency || 'BHD',
            payment_method: 'manual_entry',
            payment_reference: `PAY-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
            payment_date: new Date().toISOString(),
            status: 'completed',
            notes: 'Marked as paid by finance team'
          }
          
          const paymentResponse = await fetch(`${supabaseUrl}/rest/v1/payments`, {
            method: 'POST',
            headers: {
              'apikey': supabaseServiceRoleKey,
              'Authorization': `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(paymentPayload)
          })
          const newPayment = await paymentResponse.json()
          
          // Log activity
          await fetch(`${supabaseUrl}/rest/v1/activities`, {
            method: 'POST',
            headers: {
              'apikey': supabaseServiceRoleKey,
              'Authorization': `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              activity_type: 'invoice_paid',
              entity_type: 'invoice',
              entity_id: invoice_id,
              description: `Invoice ${invoice.invoice_number} marked as paid`,
              metadata: {
                amount: invoice.total_amount,
                customer_id: invoice.customer_id,
                payment_reference: paymentPayload.payment_reference
              }
            })
          })
          
          return new Response(JSON.stringify({ 
            success: true, 
            data: { 
              invoice: updatedInvoice[0], 
              payment: newPayment[0] 
            } 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          // Standard invoice creation
          const invoiceData = requestData
          
          // Generate unique invoice number
          const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
          
          // Calculate totals
          const items = invoiceData.items || []
          const subtotal = items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
          const discountAmount = invoiceData.discount_amount || 0
          const taxAmount = invoiceData.tax_amount || 0
          const totalAmount = subtotal - discountAmount + taxAmount
          
          const invoicePayload = {
            ...invoiceData,
            invoice_number: invoiceNumber,
            amount: subtotal,
            discount_amount: discountAmount,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            status: 'sent',
            due_date: invoiceData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
          
          const createResponse = await fetch(`${supabaseUrl}/rest/v1/invoices`, {
            method: 'POST',
            headers: {
              'apikey': supabaseServiceRoleKey,
              'Authorization': `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(invoicePayload)
          })
          const newInvoice = await createResponse.json()
          
          return new Response(JSON.stringify({ success: true, data: newInvoice[0] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      
      case 'PUT':
        const invoiceId = pathSegments[pathSegments.length - 1]
        const updateData = await req.json()
        
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/invoices?id=eq.${invoiceId}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceRoleKey,
            'Authorization': `Bearer ${supabaseServiceRoleKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(updateData)
        })
        const updatedInvoice = await updateResponse.json()
        
        return new Response(JSON.stringify({ success: true, data: updatedInvoice[0] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      
      default:
        throw new Error('Method not allowed')
    }

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: {
        code: 'INVOICES_API_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})