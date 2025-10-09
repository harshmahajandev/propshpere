CREATE TABLE campaign_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL,
    lead_id UUID NOT NULL,
    property_id UUID NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text,
    NOW()) NOT NULL,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent',
    'opened',
    'clicked',
    'responded')),
    response_data JSONB
);