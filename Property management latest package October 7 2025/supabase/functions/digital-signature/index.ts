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
        const url = new URL(req.url);
        const action = url.searchParams.get('action') || 'create';
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token and get user
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;
        const userEmail = userData.email;

        if (action === 'create') {
            const { projectId, signatureData, customerName, agreementText } = await req.json();

            if (!projectId || !signatureData || !customerName) {
                throw new Error('Project ID, signature data, and customer name are required');
            }

            // Validate signature data (base64 encoded image)
            if (!signatureData.startsWith('data:image/')) {
                throw new Error('Invalid signature data format');
            }

            // Create signature hash for verification
            const signatureHash = await crypto.subtle.digest(
                'SHA-256',
                new TextEncoder().encode(signatureData + customerName + new Date().toISOString())
            );
            const hashArray = Array.from(new Uint8Array(signatureHash));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Update snagging project with digital signature
            const updateData = {
                digital_signature: signatureData,
                final_signoff_date: new Date().toISOString(),
                signoff_by: userId,
                status: 'closed',
                signature_hash: hashHex,
                customer_name: customerName,
                customer_email: userEmail,
                agreement_text: agreementText || 'I hereby confirm that all snagging issues have been resolved to my satisfaction and I accept the handover of the property.',
                updated_at: new Date().toISOString()
            };

            const response = await fetch(`${supabaseUrl}/rest/v1/snagging_projects?id=eq.${projectId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to save signature: ${errorText}`);
            }

            const updatedProject = await response.json();

            // Generate completion certificate
            const certificate = {
                projectId: projectId,
                customerName: customerName,
                customerEmail: userEmail,
                signoffDate: new Date().toISOString(),
                signatureHash: hashHex,
                certificateId: `CERT-${Date.now()}-${projectId.slice(0, 8)}`,
                status: 'completed'
            };

            return new Response(JSON.stringify({
                data: {
                    project: updatedProject[0],
                    certificate: certificate,
                    message: 'Digital signature recorded successfully. Property handover is now complete.'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'verify') {
            const { projectId, signatureHash } = await req.json();

            if (!projectId || !signatureHash) {
                throw new Error('Project ID and signature hash are required for verification');
            }

            // Get project with signature
            const response = await fetch(`${supabaseUrl}/rest/v1/snagging_projects?id=eq.${projectId}&select=*`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            if (!response.ok) {
                throw new Error('Failed to retrieve project');
            }

            const projects = await response.json();
            if (projects.length === 0) {
                throw new Error('Project not found');
            }

            const project = projects[0];
            const isValid = project.signature_hash === signatureHash;

            return new Response(JSON.stringify({
                data: {
                    isValid: isValid,
                    project: {
                        id: project.id,
                        status: project.status,
                        signoffDate: project.final_signoff_date,
                        customerName: project.customer_name
                    },
                    verification: {
                        timestamp: new Date().toISOString(),
                        method: 'signature_hash_comparison'
                    }
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'certificate') {
            const { projectId } = await req.json();

            if (!projectId) {
                throw new Error('Project ID is required');
            }

            // Get completed project
            const response = await fetch(`${supabaseUrl}/rest/v1/snagging_projects?id=eq.${projectId}&select=*`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            if (!response.ok) {
                throw new Error('Failed to retrieve project');
            }

            const projects = await response.json();
            if (projects.length === 0) {
                throw new Error('Project not found');
            }

            const project = projects[0];
            
            if (project.status !== 'closed' || !project.digital_signature) {
                throw new Error('Project is not completed or does not have a digital signature');
            }

            // Generate completion certificate
            const certificate = {
                projectId: project.id,
                customerName: project.customer_name,
                customerEmail: project.customer_email,
                signoffDate: project.final_signoff_date,
                certificateId: `CERT-${Date.now()}-${project.id.slice(0, 8)}`,
                propertyId: project.property_id,
                totalIssues: project.total_issues,
                resolvedIssues: project.resolved_issues,
                completionRate: project.total_issues > 0 ? Math.round((project.resolved_issues / project.total_issues) * 100) : 100,
                issuedAt: new Date().toISOString(),
                issuedBy: 'Diyar Al Muharraq Property Management',
                status: 'valid'
            };

            return new Response(JSON.stringify({
                data: {
                    certificate: certificate,
                    project: {
                        id: project.id,
                        status: project.status,
                        startDate: project.start_date,
                        completionDate: project.final_signoff_date
                    }
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('Invalid action specified');

    } catch (error) {
        console.error('Digital signature error:', error);

        const errorResponse = {
            error: {
                code: 'DIGITAL_SIGNATURE_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});