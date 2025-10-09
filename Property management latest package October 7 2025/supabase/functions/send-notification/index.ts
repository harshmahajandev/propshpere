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
            to_email,
            subject,
            message,
            template_type = 'reservation_confirmation',
            template_data = {}
        } = await req.json();

        if (!to_email || !subject || !message) {
            throw new Error('Email address, subject, and message are required');
        }

        // Get Supabase credentials
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // In production, integrate with email service like SendGrid, AWS SES, etc.
        // For now, we'll simulate email sending and log the notification
        
        const emailData = {
            to: to_email,
            subject: subject,
            message: message,
            template_type: template_type,
            template_data: template_data,
            sent_at: new Date().toISOString(),
            status: 'sent' // In production, this would be based on actual email service response
        };

        console.log('Email notification sent:', emailData);

        // Create email templates based on type
        let emailContent = message;
        
        if (template_type === 'reservation_confirmation') {
            emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Diyar Property Management</h1>
                        <p style="color: white; margin: 10px 0 0 0;">Reservation Confirmation</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f9fafb;">
                        <h2 style="color: #1E40AF; margin-top: 0;">Dear ${template_data.customer_name || 'Valued Customer'},</h2>
                        
                        <p>Thank you for your interest in our property. Your reservation has been successfully received and is being processed.</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1E40AF;">
                            <h3 style="margin-top: 0; color: #1E40AF;">Reservation Details</h3>
                            <p><strong>Property:</strong> ${template_data.property_title || 'N/A'}</p>
                            <p><strong>Confirmation Number:</strong> ${template_data.confirmation_number || 'N/A'}</p>
                            <p><strong>Reservation Date:</strong> ${template_data.reservation_date || new Date().toLocaleDateString()}</p>
                            ${template_data.viewing_date ? `<p><strong>Preferred Viewing Date:</strong> ${new Date(template_data.viewing_date).toLocaleDateString()}</p>` : ''}
                            <p><strong>Status:</strong> Pending Confirmation</p>
                        </div>
                        
                        <p>Our sales team will contact you within 24 hours to confirm your reservation and schedule a viewing appointment.</p>
                        
                        <div style="background: #EBF8FF; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #1E40AF;"><strong>Next Steps:</strong></p>
                            <ul style="margin: 10px 0 0 0; color: #374151;">
                                <li>Wait for our sales representative to contact you</li>
                                <li>Prepare any questions you may have about the property</li>
                                <li>Consider your financing options if applicable</li>
                            </ul>
                        </div>
                        
                        <p>If you have any immediate questions, please don't hesitate to contact us:</p>
                        <p><strong>Phone:</strong> +973 1234 5678<br>
                           <strong>Email:</strong> info@diyar.bh</p>
                        
                        <p>Thank you for choosing Diyar for your property investment needs.</p>
                        
                        <p style="margin-top: 30px;">Best regards,<br><strong>The Diyar Team</strong></p>
                    </div>
                    
                    <div style="background: #374151; padding: 20px; text-align: center; color: white; font-size: 12px;">
                        <p style="margin: 0;">© 2025 Diyar Property Management. All rights reserved.</p>
                        <p style="margin: 5px 0 0 0;">Al Muharraq, Kingdom of Bahrain</p>
                    </div>
                </div>
            `;
        }

        // Log the notification (in production, send actual email)
        const result = {
            data: {
                email_sent: true,
                to: to_email,
                subject: subject,
                sent_at: new Date().toISOString(),
                template_type: template_type,
                message_preview: emailContent.substring(0, 200) + '...'
            }
        };

        console.log('Email notification processed:', result);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Notification sending error:', error);

        const errorResponse = {
            error: {
                code: 'NOTIFICATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});