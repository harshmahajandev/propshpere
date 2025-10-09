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
        const action = url.searchParams.get('action') || 'list';
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

        if (action === 'create-project') {
            const { propertyId, customerId, salesRepId } = await req.json();

            if (!propertyId || !customerId) {
                throw new Error('Property ID and customer ID are required');
            }

            const projectData = {
                property_id: propertyId,
                customer_id: customerId,
                sales_rep_id: salesRepId || userId,
                status: 'identified',
                start_date: new Date().toISOString().split('T')[0]
            };

            const response = await fetch(`${supabaseUrl}/rest/v1/snagging_projects`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(projectData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create project: ${errorText}`);
            }

            const project = await response.json();
            return new Response(JSON.stringify({ data: project[0] }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'create-issue') {
            const { projectId, title, description, category, priority, location } = await req.json();

            if (!projectId || !title || !category) {
                throw new Error('Project ID, title, and category are required');
            }

            const issueData = {
                snagging_project_id: projectId,
                issue_title: title,
                issue_description: description,
                category,
                priority: priority || 'medium',
                location_description: location,
                created_by: userId
            };

            const response = await fetch(`${supabaseUrl}/rest/v1/snagging_issues`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(issueData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create issue: ${errorText}`);
            }

            const issue = await response.json();
            
            // Update project total issues count
            const countResponse = await fetch(`${supabaseUrl}/rest/v1/snagging_issues?select=count&snagging_project_id=eq.${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            if (countResponse.ok) {
                const countData = await countResponse.json();
                const totalIssues = countData.length;

                await fetch(`${supabaseUrl}/rest/v1/snagging_projects?id=eq.${projectId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ total_issues: totalIssues })
                });
            }

            return new Response(JSON.stringify({ data: issue[0] }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'assign-contractor') {
            const { issueId, contractorId, dueDate } = await req.json();

            if (!issueId || !contractorId) {
                throw new Error('Issue ID and contractor ID are required');
            }

            const updateData = {
                contractor_id: contractorId,
                assigned_date: new Date().toISOString().split('T')[0],
                due_date: dueDate,
                status: 'assigned'
            };

            const response = await fetch(`${supabaseUrl}/rest/v1/snagging_issues?id=eq.${issueId}`, {
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
                throw new Error(`Failed to assign contractor: ${errorText}`);
            }

            const updatedIssue = await response.json();
            return new Response(JSON.stringify({ data: updatedIssue[0] }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'update-status') {
            const { issueId, status, cost } = await req.json();

            if (!issueId || !status) {
                throw new Error('Issue ID and status are required');
            }

            const updateData = { status };
            
            if (status === 'resolved') {
                updateData.resolved_date = new Date().toISOString().split('T')[0];
                if (cost) updateData.actual_cost = cost;
            } else if (status === 'verified') {
                updateData.verified_date = new Date().toISOString().split('T')[0];
            }

            const response = await fetch(`${supabaseUrl}/rest/v1/snagging_issues?id=eq.${issueId}`, {
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
                throw new Error(`Failed to update status: ${errorText}`);
            }

            const updatedIssue = await response.json();
            return new Response(JSON.stringify({ data: updatedIssue[0] }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('Invalid action specified');

    } catch (error) {
        console.error('Snagging management error:', error);

        const errorResponse = {
            error: {
                code: 'SNAGGING_MANAGEMENT_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});