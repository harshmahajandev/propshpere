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
        const { imageData, fileName, propertyId, imageType = 'property' } = await req.json();

        if (!imageData || !fileName) {
            throw new Error('Image data and filename are required');
        }

        // Get the service role key
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Validate user authorization if property ID is provided
        const authHeader = req.headers.get('authorization');
        if (propertyId && !authHeader) {
            throw new Error('Authorization required for property image upload');
        }

        let userId = null;
        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'apikey': serviceRoleKey
                    }
                });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    userId = userData.id;
                } else {
                    throw new Error('Invalid authorization token');
                }
            } catch (error) {
                throw new Error('Invalid authorization token');
            }
        }

        // Extract base64 data from data URL
        const base64Data = imageData.split(',')[1];
        const mimeType = imageData.split(';')[0].split(':')[1];

        // Validate image type
        if (!mimeType.startsWith('image/')) {
            throw new Error('Only image files are allowed');
        }

        // Convert base64 to binary
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Check file size (10MB limit)
        if (binaryData.length > 10 * 1024 * 1024) {
            throw new Error('File size must be less than 10MB');
        }

        // Generate unique filename
        const timestamp = Date.now();
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const finalFileName = `${timestamp}-${cleanFileName}`;

        // Upload to Supabase Storage
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/property-images/${finalFileName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': mimeType,
                'x-upsert': 'true'
            },
            body: binaryData
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Upload error:', errorText);
            throw new Error(`Upload failed: ${errorText}`);
        }

        // Get public URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/property-images/${finalFileName}`;

        // Update property images array if property ID is provided
        if (propertyId) {
            // Get current property images
            const propertyResponse = await fetch(`${supabaseUrl}/rest/v1/properties?id=eq.${propertyId}&select=images`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (propertyResponse.ok) {
                const properties = await propertyResponse.json();
                if (properties.length > 0) {
                    const currentImages = properties[0].images || [];
                    const updatedImages = [...currentImages, publicUrl];

                    // Update property with new image
                    await fetch(`${supabaseUrl}/rest/v1/properties?id=eq.${propertyId}`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            images: updatedImages,
                            updated_at: new Date().toISOString()
                        })
                    });
                }
            }
        }

        // Log activity
        if (userId) {
            await fetch(`${supabaseUrl}/rest/v1/activity_logs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    entity_type: propertyId ? 'property' : 'system',
                    entity_id: propertyId || null,
                    activity_type: 'image_uploaded',
                    description: `Image uploaded: ${finalFileName}`,
                    metadata: {
                        file_name: finalFileName,
                        file_size: binaryData.length,
                        mime_type: mimeType,
                        image_type: imageType
                    },
                    performed_by: userId
                })
            });
        }

        return new Response(JSON.stringify({
            data: {
                publicUrl,
                fileName: finalFileName,
                fileSize: binaryData.length,
                mimeType: mimeType,
                uploadedAt: new Date().toISOString()
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Image upload error:', error);

        const errorResponse = {
            error: {
                code: 'IMAGE_UPLOAD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});