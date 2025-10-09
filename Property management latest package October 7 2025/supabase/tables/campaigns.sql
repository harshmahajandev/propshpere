CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_name TEXT NOT NULL,
    property_ids UUID[] NOT NULL,
    lead_criteria JSONB NOT NULL,
    message_template TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft',
    'active',
    'paused',
    'completed')),
    sent_count INTEGER DEFAULT 0,
    response_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text,
    NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text,
    NOW()) NOT NULL
);